-- Agroconecta v2 — feed vertical (Fase 1, bloque 1b). Ver docs/design_handoff_v2_feed/PLAN-IMPLEMENTACION.md.
-- Idempotente: se puede correr más de una vez. NO correr en producción sin confirmación de Marce.
--
-- "Seguir organización" NO tiene tabla nueva: reutiliza user_subscriptions (misma semántica).
-- El orden del feed lo arma web/app/api/feed (lee también la base externa de eventos, que una RPC
-- de acá no puede ver); esta migración solo guarda interacciones, telemetría y pesos.

-- Qué tipo de contenido referencia una interacción. `event` usa el slug del evento de
-- eventosagropy (base externa, sin FK posible); `post`/`listing` usan el uuid como texto.
do $$ begin
  create type public.feed_source as enum ('post', 'event', 'listing');
exception when duplicate_object then null; end $$;

-- ── Me gusta y guardados ──────────────────────────────────────────────────────────────────
create table if not exists public.content_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  source public.feed_source not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, source, source_id)
);
create index if not exists content_likes_item_idx on public.content_likes (source, source_id);

create table if not exists public.content_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  source public.feed_source not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, source, source_id)
);
create index if not exists content_saves_item_idx on public.content_saves (source, source_id);

-- ── Recordatorios (Guardados → Recordatorios; el push del servidor se apoya acá) ─────────────
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source public.feed_source not null,
  source_id text not null,
  -- Copia del título/fecha al activar: el evento vive en otra base y Guardados tiene que poder
  -- listarse sin ir a buscarlo.
  title text not null,
  remind_at timestamptz not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, source, source_id)
);
create index if not exists reminders_due_idx on public.reminders (remind_at) where enabled;

-- ── Telemetría del feed (señales del ranking + métricas de éxito) ─────────────────────────
create table if not exists public.feed_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  source public.feed_source not null,
  source_id text not null,
  event_type text not null check (event_type in (
    'impression', 'dwell', 'skip_fast', 'like', 'save', 'share', 'cta_open', 'follow',
    'poll_vote', 'quiz_answer', 'video_complete', 'live_open', 'dismiss'
  )),
  dwell_ms integer check (dwell_ms is null or dwell_ms >= 0),
  created_at timestamptz not null default now()
);
create index if not exists feed_events_user_recent_idx on public.feed_events (user_id, created_at desc);
create index if not exists feed_events_item_idx on public.feed_events (source, source_id, event_type);

-- ── Pesos del ranking (editables desde /admin; el servidor los lee con service role) ──────
create table if not exists public.feed_weights (
  key text primary key,
  value numeric not null,
  description text not null,
  updated_at timestamptz not null default now()
);

insert into public.feed_weights (key, value, description) values
  ('w_rec', 1.0, 'Recencia (decaimiento por vida media del tipo)'),
  ('w_int', 0.8, 'Coincidencia con rubros/intereses del usuario'),
  ('w_geo', 0.5, 'Coincidencia con el departamento del usuario'),
  ('w_prof', 0.3, 'Afinidad del tipo de contenido con la profesión'),
  ('w_fol', 0.7, 'El usuario sigue a la organización'),
  ('w_eng', 0.6, 'Engagement normalizado (suavizado bayesiano)'),
  ('w_evt', 0.6, 'Cercanía del evento (sube 72 h antes)'),
  ('w_seen', 1.2, 'Penalización por ya visto (doble si fue salteado rápido)'),
  ('exploration', 0.2, 'Fracción de items fuera de los intereses declarados')
on conflict (key) do nothing;

-- ── Facetas del perfil (rubros, cultivos/especies, objetivos, escala) — las llena el onboarding v2
create table if not exists public.user_profile_facets (
  user_id uuid not null references auth.users(id) on delete cascade,
  facet text not null check (facet in ('rubro', 'produccion', 'objetivo', 'escala')),
  value text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, facet, value)
);

-- ── RLS ────────────────────────────────────────────────────────────────────────────────────
alter table public.content_likes enable row level security;
alter table public.content_saves enable row level security;
alter table public.reminders enable row level security;
alter table public.feed_events enable row level security;
alter table public.feed_weights enable row level security;
alter table public.user_profile_facets enable row level security;

drop policy if exists "users manage own likes" on public.content_likes;
create policy "users manage own likes" on public.content_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage own saves" on public.content_saves;
create policy "users manage own saves" on public.content_saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage own reminders" on public.reminders;
create policy "users manage own reminders" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- El cliente solo inserta sus propios eventos; leerlos es cosa del servidor (service role).
drop policy if exists "users insert own feed events" on public.feed_events;
create policy "users insert own feed events" on public.feed_events
  for insert with check (auth.uid() = user_id);

drop policy if exists "users manage own facets" on public.user_profile_facets;
create policy "users manage own facets" on public.user_profile_facets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- feed_weights: sin policies a propósito → solo service role (web admin y /api/feed).

-- ── Contadores por item para el ranking y la barra lateral (los lee /api/feed con service role) ─
-- Un solo viaje en vez de traer filas sueltas. Revocado para anon/authenticated: expone agregados
-- de todos los usuarios.
create or replace function public.feed_item_stats(p_since timestamptz)
returns table (source public.feed_source, source_id text, impressions bigint, cta_opens bigint, likes bigint, saves bigint)
language sql stable as $$
  select x.source, x.source_id, sum(x.i), sum(x.c), sum(x.l), sum(x.s)
  from (
    select fe.source, fe.source_id,
           (fe.event_type = 'impression')::int as i, (fe.event_type = 'cta_open')::int as c, 0 as l, 0 as s
      from public.feed_events fe
     where fe.created_at >= p_since and fe.event_type in ('impression', 'cta_open')
    union all
    select cl.source, cl.source_id, 0, 0, 1, 0 from public.content_likes cl
    union all
    select cs.source, cs.source_id, 0, 0, 0, 1 from public.content_saves cs
  ) x
  group by x.source, x.source_id
$$;

revoke execute on function public.feed_item_stats(timestamptz) from public, anon, authenticated;
