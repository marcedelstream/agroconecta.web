-- Consultas de servicio enviadas desde las páginas de servicio del menú lateral.
-- Antes el insert fallaba silenciosamente porque esta tabla no existía.

create table if not exists public.service_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  service_type text not null,
  phone text not null,
  additional_info text,
  created_at timestamptz not null default now()
);

create index if not exists service_leads_created_idx on public.service_leads (created_at desc);

alter table public.service_leads enable row level security;

drop policy if exists "users can insert own service leads" on public.service_leads;
create policy "users can insert own service leads" on public.service_leads
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists "users can read own service leads" on public.service_leads;
create policy "users can read own service leads" on public.service_leads
  for select using (auth.uid() = user_id);

notify pgrst, 'reload schema';
