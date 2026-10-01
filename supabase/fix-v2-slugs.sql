-- Agroconecta — dirección legible (slug con el título) para cursos, empleos, clasificados y libros.
-- Idempotente. NO correr en producción sin confirmación de Marce. Requiere fix-ecosystem-listings.sql
-- y fix-library.sql.
--
-- Los links públicos (/p/…, /noticias/…) usan el slug, nunca el id. Las notas ya lo tenían
-- (fix-post-slugs.sql); los avisos del ecosistema tenían la columna vacía y la biblioteca no la tenía.
-- Desde acá cualquier fila nueva sin slug lo recibe sola con un trigger, aunque se cargue por SQL.
-- El slug no cambia si después se edita el título (así los links ya compartidos siguen andando).

create or replace function public.agroconecta_slugify(input text) returns text as $$
  select trim(both '-' from regexp_replace(
    lower(translate(input, 'áéíóúñüÁÉÍÓÚÑÜ', 'aeiounuAEIOUNU')),
    '[^a-z0-9]+', '-', 'g'
  ));
$$ language sql immutable;

-- Slug libre en la tabla del trigger: "titulo", "titulo-2", "titulo-3"…
create or replace function public._fill_slug()
returns trigger language plpgsql as $$
declare
  v_base text;
  v_candidate text;
  v_n int := 1;
  v_taken boolean;
begin
  if new.slug is not null and new.slug <> '' then return new; end if;
  v_base := left(coalesce(nullif(public.agroconecta_slugify(new.title), ''), 'publicacion'), 80);
  v_candidate := v_base;
  loop
    execute format('select exists (select 1 from %I.%I where slug = $1 and id <> $2)', tg_table_schema, tg_table_name)
      into v_taken using v_candidate, new.id;
    exit when not v_taken;
    v_n := v_n + 1;
    v_candidate := v_base || '-' || v_n;
  end loop;
  new.slug := v_candidate;
  return new;
end $$;

-- ── Avisos del ecosistema (cursos, empleos, clasificados) ───────────────────────────────────
drop trigger if exists ecosystem_listings_fill_slug on public.ecosystem_listings;
create trigger ecosystem_listings_fill_slug before insert or update on public.ecosystem_listings
  for each row execute function public._fill_slug();
-- Un update "en el lugar" dispara el trigger y completa el slug de las filas existentes.
update public.ecosystem_listings set slug = null where slug = '';
update public.ecosystem_listings set title = title where slug is null;
create unique index if not exists ecosystem_listings_slug_idx on public.ecosystem_listings (slug);

-- ── Biblioteca ────────────────────────────────────────────────────────────────────────────
alter table public.library_items add column if not exists slug text;
drop trigger if exists library_items_fill_slug on public.library_items;
create trigger library_items_fill_slug before insert or update on public.library_items
  for each row execute function public._fill_slug();
update public.library_items set title = title where slug is null;
create unique index if not exists library_items_slug_idx on public.library_items (slug);

-- ── Notas: misma red de seguridad (el panel ya arma el slug, pero así nada entra sin él) ──────
drop trigger if exists posts_fill_slug on public.posts;
create trigger posts_fill_slug before insert or update on public.posts
  for each row execute function public._fill_slug();

notify pgrst, 'reload schema';
