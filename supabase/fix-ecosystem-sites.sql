-- Ecosistema editable desde el admin: cada plataforma del ecosistema (AgroJuego, etc.)
-- pasa de estar hardcodeada en la app a vivir en esta tabla, con logo propio y toggle
-- de disponible/no disponible. Los slots no disponibles muestran un placeholder
-- genérico "Próximamente nuevas soluciones" en vez del nombre real.

create table if not exists public.ecosystem_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  url text,
  logo_url text,
  category text not null default 'institucional',
  is_available boolean not null default true,
  tags text[] not null default '{}',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ecosystem_sites_order_idx on public.ecosystem_sites (order_index);

alter table public.ecosystem_sites enable row level security;

drop policy if exists "public can read ecosystem sites" on public.ecosystem_sites;
create policy "public can read ecosystem sites" on public.ecosystem_sites
  for select using (true);

insert into storage.buckets (id, name, public)
values ('ecosystem-logos', 'ecosystem-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read ecosystem logos" on storage.objects;
create policy "public read ecosystem logos" on storage.objects
  for select using (bucket_id = 'ecosystem-logos');

notify pgrst, 'reload schema';
