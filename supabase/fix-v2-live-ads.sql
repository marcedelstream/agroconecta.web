-- Agroconecta v2 — Fase 4: aviso EN VIVO y publicidad en el feed. Ver BACKEND-Y-DATOS.md §6–7.
-- Idempotente. NO correr en producción sin confirmación de Marce. Requiere fix-v2-feed.sql.

-- ── En vivo ────────────────────────────────────────────────────────────────────────────────
-- Los eventos viven en la base externa de eventosagropy (no se les pueden agregar columnas), así que
-- la transmisión en vivo es una fila propia que el admin prende y apaga. `source`/`source_id` la
-- asocian al contenido (evento por slug, remate por id de post) para abrir su ficha.
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  source public.feed_source,
  source_id text,
  title text not null,
  -- Dato en vivo del aviso desplegado, ej. "Lote 12/40 · 1.284 conectados".
  subtitle text,
  stream_url text not null,
  image_url text,
  is_live boolean not null default false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.live_sessions enable row level security;
drop policy if exists "anyone reads live sessions" on public.live_sessions;
create policy "anyone reads live sessions" on public.live_sessions for select using (is_live);

-- "No me interesa" / X del aviso en vivo, y "no ver más" de publicidad. Explorar sigue mostrando lo
-- descartado; "Mostrar en Inicio" borra la fila.
create table if not exists public.user_dismissals (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('live', 'ad')),
  ref_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, kind, ref_id)
);
alter table public.user_dismissals enable row level security;
drop policy if exists "users manage own dismissals" on public.user_dismissals;
create policy "users manage own dismissals" on public.user_dismissals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Publicidad ─────────────────────────────────────────────────────────────────────────────
-- Placements nuevos (el campo ya es text[]): 'feed' (item a pantalla completa) y 'article_inline'
-- (bloque dentro de la noticia). Datos que el item del feed necesita además de la imagen:
alter table public.ad_campaigns add column if not exists advertiser_name text;
alter table public.ad_campaigns add column if not exists body text;
alter table public.ad_campaigns add column if not exists cta_label text;
do $$ begin
  alter table public.ad_campaigns add constraint ad_campaigns_cta_label_len check (cta_label is null or char_length(cta_label) <= 18);
exception when duplicate_object then null; end $$;

-- Impresiones y clics para el reporte al anunciante (es lo que se le vende).
create table if not exists public.ad_events (
  id bigint generated always as identity primary key,
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('impression', 'click', 'why_opened', 'dismiss')),
  placement text not null,
  department text,
  created_at timestamptz not null default now()
);
create index if not exists ad_events_campaign_idx on public.ad_events (campaign_id, event_type);
alter table public.ad_events enable row level security;
drop policy if exists "users insert own ad events" on public.ad_events;
create policy "users insert own ad events" on public.ad_events for insert with check (auth.uid() = user_id);

-- Reporte por campaña (lo lee /admin con service role).
create or replace view public.ad_campaign_report as
  select
    c.id as campaign_id,
    c.title,
    c.advertiser_name,
    count(*) filter (where e.event_type = 'impression') as impressions,
    count(*) filter (where e.event_type = 'click') as clicks,
    count(distinct e.user_id) filter (where e.event_type = 'impression') as reach,
    coalesce(round(100.0 * count(*) filter (where e.event_type = 'click')
      / nullif(count(*) filter (where e.event_type = 'impression'), 0), 2), 0) as ctr_percent
  from public.ad_campaigns c
  left join public.ad_events e on e.campaign_id = c.id
  group by c.id, c.title, c.advertiser_name;
revoke all on public.ad_campaign_report from anon, authenticated;
