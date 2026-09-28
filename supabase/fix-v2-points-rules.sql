-- Agroconecta v2 — reglas del Reglamento de puntos (web/app/reglamento-puntos).
-- Idempotente. NO correr en producción sin confirmación de Marce. Requiere fix-v2-points.sql,
-- fix-v2-rewards.sql y fix-v2-reminder-push.sql (usa pg_cron, que activa ese script).
--
-- 1. Los puntos vencen tras 12 meses sin movimientos (ni sumar ni canjear).
-- 2. El código de canje vale 60 días; después queda "vencido" y no se puede validar.
-- 3. Completar el perfil profesional suma puntos (una sola vez).
-- 4. Anular los puntos de una cuenta por trampa (solo desde el servidor / panel).

-- ── Configuración ──────────────────────────────────────────────────────────────────────────
insert into public.points_config (key, value, description) values
  ('profile_complete', 30, 'Puntos por completar el perfil profesional (una sola vez)'),
  ('redemption_days', 60, 'Días de validez de un código de canje')
on conflict (key) do nothing;
update public.points_config set value = 12, description = 'Meses sin movimientos hasta que vencen los puntos (null = no vencen)'
  where key = 'expiry_months' and value is null;

-- ── 1. Vencimiento por inactividad ─────────────────────────────────────────────────────────
-- Una fila negativa por el saldo completo: el historial muestra "Vencimiento de puntos" y el saldo
-- queda en 0. Como esa fila es el último movimiento, no se vuelve a vencer hasta que sume de nuevo.
create or replace function public.expire_inactive_points()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_months numeric;
  v_count integer;
begin
  select value into v_months from public.points_config where key = 'expiry_months';
  if v_months is null then return 0; end if;
  insert into public.points_ledger (user_id, delta, source, source_ref, description)
    select l.user_id, -sum(l.delta)::integer, 'expiry', to_char(now(), 'YYYY-MM-DD'), 'Vencimiento de puntos por inactividad'
    from public.points_ledger l
    group by l.user_id
    having sum(l.delta) > 0 and max(l.created_at) < now() - make_interval(months => v_months::integer)
  on conflict (user_id, source, source_ref) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end $$;
revoke execute on function public.expire_inactive_points() from public, anon, authenticated;

-- ── 2. Validez del código de canje ─────────────────────────────────────────────────────────
-- Los códigos ya emitidos arrancan a contar desde hoy (no se vencen de golpe al correr esto).
alter table public.reward_redemptions add column if not exists expires_at timestamptz;
update public.reward_redemptions set expires_at = now() + interval '60 days' where expires_at is null;
alter table public.reward_redemptions alter column expires_at set not null;

create or replace function public._set_redemption_expiry()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_days numeric;
begin
  select value into v_days from public.points_config where key = 'redemption_days';
  new.expires_at := now() + make_interval(days => coalesce(v_days, 60)::integer);
  return new;
end $$;
drop trigger if exists reward_redemptions_expiry on public.reward_redemptions;
create trigger reward_redemptions_expiry before insert on public.reward_redemptions
  for each row execute function public._set_redemption_expiry();

create or replace function public.expire_redemptions()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  update public.reward_redemptions set status = 'vencido' where status = 'emitido' and expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end $$;
revoke execute on function public.expire_redemptions() from public, anon, authenticated;

-- ── 3. Perfil profesional completo ─────────────────────────────────────────────────────────
-- "Completo" = cargo, dónde trabaja, formación y al menos una especialidad. Lo verifica el servidor.
create or replace function public.claim_profile_points()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_points integer;
begin
  if v_user is null then return 0; end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = v_user
      and nullif(trim(p.headline), '') is not null
      and nullif(trim(p.current_org), '') is not null
      and nullif(trim(p.education), '') is not null
      and coalesce(array_length(p.specialties, 1), 0) > 0
  ) then return 0; end if;
  select value::integer into v_points from public.points_config where key = 'profile_complete';
  return public._award_points(v_user, coalesce(v_points, 0), 'profile', 'profile', 'Perfil profesional completo');
end $$;
revoke execute on function public.claim_profile_points() from anon;

-- ── 4. Anular puntos por trampa ────────────────────────────────────────────────────────────
-- Deja el saldo en 0 con un movimiento visible y anula sus códigos sin usar. La cuenta sigue activa
-- (decisión de Marce).
create or replace function public.void_user_points(p_user uuid, p_reason text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_balance integer;
begin
  update public.reward_redemptions set status = 'anulado' where user_id = p_user and status = 'emitido';
  select coalesce(sum(delta), 0) into v_balance from public.points_ledger where user_id = p_user;
  if v_balance <= 0 then return 0; end if;
  insert into public.points_ledger (user_id, delta, source, source_ref, description)
    values (p_user, -v_balance, 'void', gen_random_uuid()::text, 'Puntos anulados: ' || coalesce(nullif(trim(p_reason), ''), 'incumplimiento del reglamento'));
  return v_balance;
end $$;
revoke execute on function public.void_user_points(uuid, text) from public, anon, authenticated;

-- ── Tareas diarias (04:00 de Paraguay = 07:00 UTC) ──────────────────────────────────────────
select cron.unschedule(jobid) from cron.job where jobname = 'agro-points-expiry';
select cron.schedule('agro-points-expiry', '0 7 * * *', 'select public.expire_inactive_points(); select public.expire_redemptions();');
