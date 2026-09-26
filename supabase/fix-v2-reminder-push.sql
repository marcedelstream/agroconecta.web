-- Agroconecta v2 — recordatorios enviados desde el servidor (push "En 1 hora: …").
-- Idempotente. NO correr en producción sin confirmación de Marce. Requiere fix-v2-feed.sql.
--
-- Antes el recordatorio lo programaba el propio teléfono (notificación local). Ahora lo manda la base:
-- pg_cron corre cada 5 minutos, junta los recordatorios que ya tocan, y pg_net los manda al servicio
-- de push de Expo (el mismo que usa web/lib/push.ts). Así llega aunque se haya reinstalado la app o
-- cambiado de teléfono, y queda registro de qué se mandó.
--
-- Si Supabase dice que falta la extensión: Dashboard → Database → Extensions → activar pg_cron y pg_net.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

alter table public.reminders add column if not exists sent_at timestamptz;
create index if not exists reminders_pending_idx on public.reminders (remind_at) where enabled and sent_at is null;

-- Datos para abrir la pantalla correcta al tocar la notificación (mobile/app/_layout.tsx).
create or replace function public._reminder_push_data(p_source public.feed_source, p_source_id text)
returns jsonb language sql immutable as $$
  select case p_source
    when 'event' then jsonb_build_object('eventSlug', p_source_id)
    when 'post' then jsonb_build_object('articleId', p_source_id)
    else jsonb_build_object('listingId', p_source_id)
  end
$$;

create or replace function public.send_due_reminders()
returns integer language plpgsql security definer set search_path = public, extensions as $$
declare
  v_messages jsonb;
  v_ids uuid[];
  v_sent integer := 0;
begin
  -- Solo lo que ya tocaba y no es viejo (si el cron estuvo caído, no se mandan avisos de ayer).
  select array_agg(r.id) into v_ids
  from public.reminders r
  where r.enabled and r.sent_at is null
    and r.remind_at <= now() and r.remind_at > now() - interval '2 hours';

  if v_ids is null then return 0; end if;

  select jsonb_agg(jsonb_build_object(
    'to', t.expo_token,
    'title', 'En 1 hora: ' || r.title,
    'body', 'Tocá para ver los detalles.',
    'data', public._reminder_push_data(r.source, r.source_id),
    'channelId', 'important-posts',
    'sound', 'default',
    'priority', 'high'
  ))
  into v_messages
  from public.reminders r
  join public.push_tokens t on t.user_id = r.user_id and t.enabled
  where r.id = any(v_ids);

  -- Expo acepta hasta 100 mensajes por pedido.
  if v_messages is not null then
    for i in 0 .. (jsonb_array_length(v_messages) - 1) / 100 loop
      perform net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb,
        body := (select jsonb_agg(m) from (
          select m from jsonb_array_elements(v_messages) with ordinality as e(m, n)
          where n > i * 100 and n <= (i + 1) * 100
        ) s)
      );
    end loop;
    v_sent := jsonb_array_length(v_messages);
  end if;

  -- Se marca como enviado aunque la persona no tenga token: no tiene sentido reintentar.
  update public.reminders set sent_at = now() where id = any(v_ids);
  return v_sent;
end $$;
revoke execute on function public.send_due_reminders() from public, anon, authenticated;

-- Cada 5 minutos (se reprograma si ya existía).
select cron.unschedule(jobid) from cron.job where jobname = 'agro-reminders';
select cron.schedule('agro-reminders', '*/5 * * * *', 'select public.send_due_reminders()');
