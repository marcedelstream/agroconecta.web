insert into storage.buckets (id, name, public)
values
  ('organization-logos', 'organization-logos', true),
  ('banners', 'banners', true)
on conflict (id) do update set public = excluded.public;

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  target_professions text[] not null default '{}',
  target_departments text[] not null default '{}',
  target_categories text[] not null default '{}',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ad_campaigns enable row level security;

drop policy if exists "public can read active ads" on public.ad_campaigns;
create policy "public can read active ads" on public.ad_campaigns
  for select using (
    is_active = true
    and starts_at <= now()
    and (ends_at is null or ends_at >= now())
  );

drop policy if exists "public read organization logos" on storage.objects;
create policy "public read organization logos" on storage.objects
  for select using (bucket_id = 'organization-logos');

drop policy if exists "public read banners" on storage.objects;
create policy "public read banners" on storage.objects
  for select using (bucket_id = 'banners');

notify pgrst, 'reload schema';
