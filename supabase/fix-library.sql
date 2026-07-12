-- Biblioteca digital (tipo Netflix): catálogo de libros/documentos del agro. El usuario guarda
-- títulos en "Mi biblioteca" (user_library) para encontrarlos después.

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  description text not null,
  category text not null,
  cover_image_url text not null,
  file_url text not null,
  file_type text not null default 'pdf',
  page_count integer,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_library (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.library_items(id) on delete cascade,
  added_at timestamptz not null default now(),
  last_opened_at timestamptz,
  progress_percent numeric(5, 2) default 0,
  primary key (user_id, item_id)
);

alter table public.library_items enable row level security;
alter table public.user_library enable row level security;

create policy "public can read published library items" on public.library_items
  for select using (is_published = true);

create policy "users manage own library" on public.user_library
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- library-covers: público (se ve en el grid tipo Netflix sin login).
-- library-files: privado — el archivo se sirve con URL firmada, no queda expuesto por bucket público.
insert into storage.buckets (id, name, public)
values ('library-covers', 'library-covers', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('library-files', 'library-files', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read library covers" on storage.objects;
create policy "public read library covers" on storage.objects
  for select using (bucket_id = 'library-covers');

notify pgrst, 'reload schema';
