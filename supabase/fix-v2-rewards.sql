-- Agroconecta v2 — Fase 5: premios y canjes. Ver BACKEND-Y-DATOS.md §5.
-- Idempotente. NO correr en producción sin confirmación de Marce. Requiere fix-v2-points.sql.
-- IMPORTANTE: no se lanza sin premios reales confirmados por aliados (decisión D4).

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('curso', 'evento', 'charla')),
  title text not null,
  description text,
  partner_org_id uuid references public.organizations(id) on delete set null,
  -- Nombre del aliado para mostrar aunque no sea una organización cargada.
  partner_name text,
  image_url text,
  cost integer not null check (cost > 0),
  -- null = sin límite de cupos.
  stock integer check (stock is null or stock >= 0),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete restrict,
  code text not null unique,
  status text not null default 'emitido' check (status in ('emitido', 'usado', 'vencido', 'anulado')),
  created_at timestamptz not null default now(),
  used_at timestamptz
);
create index if not exists reward_redemptions_user_idx on public.reward_redemptions (user_id, created_at desc);

alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
drop policy if exists "anyone reads active rewards" on public.rewards;
create policy "anyone reads active rewards" on public.rewards for select using (is_active);
drop policy if exists "users read own redemptions" on public.reward_redemptions;
create policy "users read own redemptions" on public.reward_redemptions for select using (auth.uid() = user_id);
-- Sin policies de escritura: se canjea solo por redeem_reward(), y el admin marca "usado" con service role.

-- Canje transaccional: bloquea el premio, valida vigencia, cupo y saldo, emite el código y descuenta
-- en el ledger, todo o nada. El FOR UPDATE evita que dos canjes simultáneos se lleven el último cupo,
-- y el advisory lock por usuario evita gastar el mismo saldo dos veces en paralelo.
create or replace function public.redeem_reward(p_reward uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_reward public.rewards%rowtype;
  v_balance integer;
  v_code text;
  v_redemption uuid;
begin
  if v_user is null then raise exception 'No autorizado'; end if;
  perform pg_advisory_xact_lock(hashtext('redeem:' || v_user::text));

  select * into v_reward from public.rewards where id = p_reward for update;
  if not found or not v_reward.is_active or (v_reward.valid_until is not null and v_reward.valid_until < now()) then
    return json_build_object('ok', false, 'error', 'unavailable');
  end if;
  if v_reward.stock is not null and v_reward.stock <= 0 then
    return json_build_object('ok', false, 'error', 'out_of_stock');
  end if;

  select coalesce(sum(delta), 0) into v_balance from public.points_ledger where user_id = v_user;
  if v_balance < v_reward.cost then
    return json_build_object('ok', false, 'error', 'insufficient', 'missing', v_reward.cost - v_balance);
  end if;

  -- AGRO-XXXX sin letras confusas (0/O, 1/I).
  loop
    v_code := 'AGRO-' || (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') from generate_series(1, 4));
    exit when not exists (select 1 from public.reward_redemptions where code = v_code);
  end loop;

  insert into public.reward_redemptions (user_id, reward_id, code) values (v_user, p_reward, v_code) returning id into v_redemption;
  if v_reward.stock is not null then
    update public.rewards set stock = stock - 1 where id = p_reward;
  end if;
  insert into public.points_ledger (user_id, delta, source, source_ref, description)
    values (v_user, -v_reward.cost, 'redeem', v_redemption::text, 'Canje: ' || v_reward.title);

  return json_build_object('ok', true, 'code', v_code, 'balance', v_balance - v_reward.cost);
end $$;
revoke execute on function public.redeem_reward(uuid) from anon;
