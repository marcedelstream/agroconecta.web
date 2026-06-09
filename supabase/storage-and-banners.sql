insert into storage.buckets (id, name, public)
values
  ('organization-logos', 'organization-logos', true),
  ('banners', 'banners', true)
on conflict (id) do update set public = excluded.public;

alter table posts
  add column if not exists target_departments text[] not null default '{}';

create table if not exists ad_campaigns (
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

alter table ad_campaigns enable row level security;

drop policy if exists "public read organization logos" on storage.objects;
drop policy if exists "public read banners" on storage.objects;
drop policy if exists "public can read active ads" on ad_campaigns;

create policy "public read organization logos" on storage.objects
  for select using (bucket_id = 'organization-logos');

create policy "public read banners" on storage.objects
  for select using (bucket_id = 'banners');

create policy "public can read active ads" on ad_campaigns
  for select using (is_active = true and starts_at <= now() and (ends_at is null or ends_at >= now()));

insert into ad_campaigns (title, image_url, target_professions, target_departments, target_categories)
values
  ('Financia tu rodeo', 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/ganaderia-creditos.png', array['productor'], array[]::text[], array['ganaderia']),
  ('Semillas para la zafra', 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/semillas-zafra.png', array['productor','agronomo'], array[]::text[], array['agricultura']),
  ('Sanidad animal', 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/sanidad-animal.png', array['veterinario','productor'], array[]::text[], array['ganaderia'])
on conflict do nothing;
