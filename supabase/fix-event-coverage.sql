-- Cobertura especial de eventos: banner -> hub dinámico (Info / Programa / Noticias)
-- Los eventos en sí viven en el Supabase externo de eventosagropy.com (ver lib/supabase-events.ts),
-- así que acá solo guardamos el "extra" que gestiona Agroconecta: a qué apunta cada banner,
-- el programa/agenda del evento y qué noticias propias quedan asociadas a ese evento (por slug).

alter table public.ad_campaigns
  add column if not exists link_type text check (link_type in ('event', 'post', 'url', 'course')),
  add column if not exists link_target text;

alter table public.posts
  add column if not exists event_tag text;

create index if not exists posts_event_tag_idx on public.posts (event_tag) where event_tag is not null;

create table if not exists public.event_schedule_items (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  day_label text,
  time text,
  title text not null,
  description text,
  speaker text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_schedule_items_slug_idx on public.event_schedule_items (event_slug, order_index);

alter table public.event_schedule_items enable row level security;

drop policy if exists "public can read event schedule" on public.event_schedule_items;
create policy "public can read event schedule" on public.event_schedule_items
  for select using (true);

notify pgrst, 'reload schema';
