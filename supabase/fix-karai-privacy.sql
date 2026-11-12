-- Karai — privacidad (2026-11-12). Idempotente. NO correr en producción sin confirmación.
--
-- 1) Consentimientos de Karai (karai_ai, karai_campo): evita dos otorgamientos vigentes a la vez
--    si llegan dos pedidos en paralelo. El índice es parcial y solo cubre los tipos de Karai, así no
--    choca con filas de otros consentimientos que ya existan (p. ej. los del onboarding).
-- 2) Retención: función que borra conversaciones inactivas hace más de N días. Los mensajes caen
--    por `on delete cascade`; los leads comerciales (karai_leads.conversation_id es `on delete set
--    null`) se conservan a propósito, igual que cuando el usuario borra un chat a mano.
--
-- Retención: 365 días sin actividad (decisión del dueño). Solo borra chats; los datos de la finca
-- (farm_profile) y los leads no se tocan.

-- 1) ---------------------------------------------------------------------------------------------
create unique index if not exists consents_karai_granted_unique
  on public.consents (profile_id, consent_type)
  where status = 'granted' and consent_type in ('karai_ai', 'karai_campo');

-- 2) ---------------------------------------------------------------------------------------------
-- Borra las conversaciones (y sus mensajes) sin actividad hace más de `retention_days` días.
-- Devuelve cuántas conversaciones borró. Solo la puede ejecutar el service role / pg_cron.
create or replace function public.purge_old_karai_conversations(retention_days integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  if retention_days is null or retention_days < 30 then
    raise exception 'retention_days debe ser al menos 30 (recibido: %)', retention_days;
  end if;

  delete from public.conversations
  where last_message_at < now() - make_interval(days => retention_days);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_old_karai_conversations(integer) from public, anon, authenticated;

-- Plazo decidido por el dueño (2026-11-12): 365 días sin actividad. Se programa a diario si pg_cron
-- está habilitado (Supabase: Dashboard → Database → Extensions → pg_cron); si no, avisa y se puede
-- volver a correr este bloque después de habilitarlo.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'karai-purge-old-conversations',
      '30 6 * * *',  -- todos los días 06:30 UTC (03:30 en Paraguay)
      $job$ select public.purge_old_karai_conversations(365) $job$
    );
  else
    raise notice 'pg_cron no está habilitado: la purga de conversaciones NO quedó programada.';
  end if;
end;
$$;

-- Para ver qué borraría antes de correr la migración:
--   select count(*) from public.conversations where last_message_at < now() - interval '365 days';
-- Para desprogramarlo:
--   select cron.unschedule('karai-purge-old-conversations');

notify pgrst, 'reload schema';
