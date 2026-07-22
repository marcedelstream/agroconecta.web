  -- Sindicacion autorizada de noticias externas.
-- Cada fuente pertenece a una organizacion y las noticias importadas quedan como posts normales,
-- pero con trazabilidad para deduplicar y auditar el origen.

do $$
begin
  create type news_source_type as enum ('wordpress', 'rss', 'html_og');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type syndication_republish_policy as enum ('preview_only', 'full_republish');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  site_url text not null,
  feed_url text not null,
  source_type news_source_type not null default 'rss',
  category text not null default 'institucional',
  republish_policy syndication_republish_policy not null default 'full_republish',
  default_editorial_status editorial_status not null default 'pending_review',
  max_items_per_run integer not null default 5 check (max_items_per_run between 1 and 20),
  is_active boolean not null default true,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, feed_url)
);

alter table public.posts add column if not exists source_id uuid references public.news_sources(id) on delete set null;
alter table public.posts add column if not exists external_url text;
alter table public.posts add column if not exists external_id text;
alter table public.posts add column if not exists imported_at timestamptz;
alter table public.posts add column if not exists content_hash text;

create unique index if not exists posts_external_url_idx
  on public.posts (external_url)
  where external_url is not null;

create unique index if not exists posts_source_external_id_idx
  on public.posts (source_id, external_id)
  where source_id is not null and external_id is not null;

create index if not exists news_sources_active_idx
  on public.news_sources (is_active, last_checked_at);

alter table public.news_sources enable row level security;

drop policy if exists "public can read active news sources" on public.news_sources;
create policy "public can read active news sources" on public.news_sources
  for select using (is_active = true);

insert into public.organizations (slug, name, description, type, is_verified, commercial_status, plan_name, logo_url)
values
  ('ugp', 'Union de Gremios de la Produccion', 'Gremio nacional que nuclea referentes de la produccion agropecuaria paraguaya.', 'gremio', true, 'trial', 'Sindicacion piloto', 'https://ui-avatars.com/api/?name=UGP&background=A4D233&color=0A0A13&size=256'),
  ('indert', 'INDERT', 'Instituto Nacional de Desarrollo Rural y de la Tierra.', 'institucion', true, 'trial', 'Sindicacion piloto', 'https://ui-avatars.com/api/?name=INDERT&background=22C55E&color=fff&size=256'),
  ('infona', 'INFONA', 'Instituto Forestal Nacional.', 'institucion', true, 'trial', 'Sindicacion piloto', 'https://ui-avatars.com/api/?name=INFONA&background=166534&color=fff&size=256'),
  ('cafyf', 'CAFYF', 'Camara de Fitosanitarios y Fertilizantes.', 'gremio', true, 'trial', 'Sindicacion piloto', 'https://ui-avatars.com/api/?name=CAFYF&background=3B82F6&color=fff&size=256'),
  ('fepama', 'FEPAMA', 'Federacion Paraguaya de Madereros.', 'gremio', true, 'trial', 'Sindicacion piloto', 'https://ui-avatars.com/api/?name=FEPAMA&background=92400E&color=fff&size=256'),
  ('mades', 'MADES', 'Ministerio del Ambiente y Desarrollo Sostenible.', 'institucion', true, 'trial', 'Sindicacion piloto', 'https://ui-avatars.com/api/?name=MADES&background=166534&color=fff&size=256'),
  ('mic', 'MIC', 'Ministerio de Industria y Comercio.', 'institucion', true, 'trial', 'Sindicacion piloto', 'https://ui-avatars.com/api/?name=MIC&background=3B82F6&color=fff&size=256')
on conflict (slug) do nothing;
-- Fuentes piloto. Las inserciones usan select por slug: si la organizacion todavia no existe,
-- no se crea una fuente huerfana.
insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'SENACSA Noticias', 'https://senacsa.gov.py/', 'https://senacsa.gov.py/wp-json/wp/v2/posts?per_page=5&_embed=1', 'wordpress', 'ganaderia'
from public.organizations where slug = 'senacsa'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'SENAVE Noticias', 'https://www.senave.gov.py/', 'https://www.senave.gov.py/wp-json/wp/v2/posts?per_page=5&_embed=1', 'wordpress', 'agricultura'
from public.organizations where slug = 'senave'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'ARP Noticias', 'https://www.arp.org.py/', 'https://www.arp.org.py/index.php?format=feed&type=rss', 'rss', 'ganaderia'
from public.organizations where slug = 'arp'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'UGP Noticias', 'https://www.ugp.org.py/', 'https://www.ugp.org.py/feed/', 'rss', 'agricultura'
from public.organizations where slug = 'ugp'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'INDERT Noticias', 'https://www.indert.gov.py/indert/index.php/noticias', 'https://www.indert.gov.py/indert/index.php/noticias?format=feed&type=rss', 'rss', 'institucional'
from public.organizations where slug = 'indert'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'INFONA Noticias', 'https://infona.gov.py/', 'https://infona.gov.py/feed/', 'rss', 'institucional'
from public.organizations where slug = 'infona'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;


insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'CAFYF Noticias', 'https://www.cafyf.org/', 'https://www.cafyf.org/feed/', 'rss', 'agricultura'
from public.organizations where slug = 'cafyf'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'FEPAMA Noticias', 'https://fepama.org/', 'https://fepama.org/feed/', 'rss', 'institucional'
from public.organizations where slug = 'fepama'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'MADES Noticias', 'https://www.mades.gov.py/', 'https://www.mades.gov.py/wp-json/wp/v2/posts?per_page=5&_embed=1', 'wordpress', 'institucional'
from public.organizations where slug = 'mades'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

insert into public.news_sources (organization_id, name, site_url, feed_url, source_type, category)
select id, 'MIC Noticias', 'https://www.mic.gov.py/', 'https://www.mic.gov.py/wp-json/wp/v2/posts?per_page=5&_embed=1', 'wordpress', 'mercados'
from public.organizations where slug = 'mic'
on conflict (organization_id, feed_url) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  category = excluded.category,
  is_active = true;

update public.news_sources set is_active = false
where name in ('CONAMURI Noticias', 'Red Rural Noticias');
update public.news_sources set republish_policy = 'full_republish'
where is_active = true;
notify pgrst, 'reload schema';







