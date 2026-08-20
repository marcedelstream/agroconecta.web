-- Foto de perfil y banner promocional de un evento (v1.1.0, feature 6 — evento especial
-- estilo OneFootball). Igual que event_schedule_items, esto NO vive en la base externa de
-- eventosagropy.com (no tenemos acceso a su schema) — es un "extra" de Agroconecta,
-- referenciado por event_slug (texto, sin FK real entre las dos bases).

create table if not exists public.event_media (
  event_slug text primary key,
  profile_image_url text,
  banner_image_url text,
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Por si esta migración ya se corrió antes de sumar el toggle "activo" (banner destacado en Home).
alter table public.event_media add column if not exists is_active boolean not null default false;

alter table public.event_media enable row level security;

drop policy if exists "public can read event media" on public.event_media;
create policy "public can read event media" on public.event_media
  for select using (true);

notify pgrst, 'reload schema';
