-- Slugs legibles para las noticias. Antes la URL pública armaba "titulo-<uuid>" al vuelo
-- (ver web/lib/seo.ts); ahora el slug es una columna real, generada del título, sin el uuid.

alter table public.posts add column if not exists slug text;

create or replace function public.agroconecta_slugify(input text) returns text as $$
  select trim(both '-' from regexp_replace(
    lower(translate(input, 'áéíóúñüÁÉÍÓÚÑÜ', 'aeiounuAEIOUNU')),
    '[^a-z0-9]+', '-', 'g'
  ));
$$ language sql immutable;

-- Backfill de las filas existentes, con sufijo numérico si el título se repite.
do $$
declare
  r record;
  base_slug text;
  candidate text;
  n int;
begin
  for r in select id, title from public.posts where slug is null order by created_at loop
    base_slug := public.agroconecta_slugify(r.title);
    if base_slug = '' then base_slug := 'noticia'; end if;
    candidate := base_slug;
    n := 1;
    while exists (select 1 from public.posts where slug = candidate and id <> r.id) loop
      n := n + 1;
      candidate := base_slug || '-' || n;
    end loop;
    update public.posts set slug = candidate where id = r.id;
  end loop;
end $$;

alter table public.posts alter column slug set not null;
create unique index if not exists posts_slug_idx on public.posts (slug);

notify pgrst, 'reload schema';
