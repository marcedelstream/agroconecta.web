create type app_role as enum ('agro_admin', 'org_admin', 'org_editor');
create type organization_type as enum ('media', 'asociacion', 'institucion', 'gremio', 'rematadora', 'empresa');
create type commercial_status as enum ('trial', 'active', 'overdue', 'paused');
create type editorial_status as enum ('draft', 'pending_review', 'published', 'rejected', 'archived');
create type content_type as enum ('article', 'video', 'auction', 'institutional_notice');
create type auction_status as enum ('upcoming', 'live', 'finished', 'unavailable');
create type market_price_kind as enum ('cattle', 'international');
create type currency_code as enum ('PYG', 'USD');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  profession text not null,
  department text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  type organization_type not null,
  is_verified boolean not null default false,
  commercial_status commercial_status not null default 'trial',
  plan_name text not null default 'Piloto',
  plan_started_at date,
  billing_notes text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'org_editor',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table user_interests (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, category)
);

create table user_subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  summary text not null,
  content text not null,
  category text not null,
  target_departments text[] not null default '{}',
  content_type content_type not null default 'article',
  editorial_status editorial_status not null default 'draft',
  is_important boolean not null default false,
  is_highlighted boolean not null default false,
  image_url text,
  youtube_url text,
  auction_status auction_status,
  starts_at timestamptz,
  published_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table market_prices (
  id uuid primary key default gen_random_uuid(),
  kind market_price_kind not null,
  label text not null,
  market text not null,
  currency currency_code not null,
  unit text not null,
  value numeric(14, 2) not null,
  change numeric(14, 2) not null default 0,
  change_percent numeric(7, 3) not null default 0,
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_token text not null unique,
  platform text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ad_campaigns (
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

create index posts_published_feed_idx on posts (published_at desc) where editorial_status = 'published';
create index posts_organization_idx on posts (organization_id, editorial_status, published_at desc);
create index subscriptions_organization_idx on user_subscriptions (organization_id);

alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table user_interests enable row level security;
alter table user_subscriptions enable row level security;
alter table posts enable row level security;
alter table market_prices enable row level security;
alter table push_tokens enable row level security;
alter table ad_campaigns enable row level security;

create policy "public can read active organizations" on organizations
  for select using (commercial_status in ('trial', 'active', 'overdue'));

create policy "public can read published posts" on posts
  for select using (editorial_status = 'published');

create policy "public can read market prices" on market_prices
  for select using (true);

create policy "public can read active ads" on ad_campaigns
  for select using (is_active = true and starts_at <= now() and (ends_at is null or ends_at >= now()));

create policy "users manage own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "users manage own interests" on user_interests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own subscriptions" on user_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own push tokens" on push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('organization-logos', 'organization-logos', true),
  ('banners', 'banners', true)
on conflict (id) do update set public = excluded.public;

create policy "public read organization logos" on storage.objects
  for select using (bucket_id = 'organization-logos');

create policy "public read banners" on storage.objects
  for select using (bucket_id = 'banners');
