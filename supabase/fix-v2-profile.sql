-- Agroconecta v2 — Perfil tipo CV profesional (Fase 1, bloque 1e). Ver docs/design_handoff_v2_feed.
-- Idempotente. NO correr en producción sin confirmación de Marce.
--
-- Columnas nuevas en `profiles` (la policy "users manage own profile" ya cubre lectura/escritura
-- del dueño). `profile_public` y `slug` los usa el perfil público web (/u/[slug], Fase 5): hasta
-- que el usuario lo active, el perfil no es visible para nadie más.

alter table public.profiles add column if not exists slug text;
alter table public.profiles add column if not exists headline text;
alter table public.profiles add column if not exists current_org text;
alter table public.profiles add column if not exists education text;
alter table public.profiles add column if not exists country text not null default 'Paraguay';
alter table public.profiles add column if not exists bio text;
-- [{ "role": "...", "org": "...", "period": "2019 – hoy" }]
alter table public.profiles add column if not exists experience jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists specialties text[] not null default '{}';
-- { "linkedin": "...", "instagram": "...", "facebook": "...", "x": "...", "youtube": "...", "website": "..." }
alter table public.profiles add column if not exists socials jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists profile_public boolean not null default false;

create unique index if not exists profiles_slug_key on public.profiles (lower(slug)) where slug is not null;

do $$ begin
  alter table public.profiles
    add constraint profiles_slug_format check (slug is null or slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$');
exception when duplicate_object then null; end $$;
