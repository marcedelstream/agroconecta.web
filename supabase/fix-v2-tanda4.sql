-- Agroconecta v2 — tanda 4 de la review: libros en el feed, interés en suscripciones del onboarding.
-- Idempotente. NO correr en producción sin confirmación de Marce. Requiere fix-v2-feed.sql y fix-library.sql.

-- ── 1. Libros de la biblioteca como contenido del feed ─────────────────────────────────────
-- 'library' se suma a las fuentes del feed (guardar, me gusta, métricas). Las funciones de abajo
-- comparan con el texto en tiempo de ejecución, así que el valor nuevo se puede usar en este mismo script.
alter type public.feed_source add value if not exists 'library';

-- Guardar un libro en el feed y "Mis colecciones" de la Biblioteca son lo mismo: cada tabla replica
-- en la otra. El "on conflict do nothing" / borrar lo que ya no está cortan el rebote entre triggers.
create or replace function public._sync_library_from_saves()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.source::text = 'library' then
    insert into public.user_library (user_id, item_id)
      select new.user_id, li.id from public.library_items li where li.id::text = new.source_id
      on conflict do nothing;
  elsif tg_op = 'DELETE' and old.source::text = 'library' then
    delete from public.user_library where user_id = old.user_id and item_id::text = old.source_id;
  end if;
  return null;
end $$;
drop trigger if exists content_saves_library_sync on public.content_saves;
create trigger content_saves_library_sync after insert or delete on public.content_saves
  for each row execute function public._sync_library_from_saves();

create or replace function public._sync_saves_from_library()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.content_saves (user_id, source, source_id)
      values (new.user_id, 'library'::text::public.feed_source, new.item_id::text)
      on conflict do nothing;
  else
    delete from public.content_saves where user_id = old.user_id and source::text = 'library' and source_id = old.item_id::text;
  end if;
  return null;
end $$;
drop trigger if exists user_library_saves_sync on public.user_library;
create trigger user_library_saves_sync after insert or delete on public.user_library
  for each row execute function public._sync_saves_from_library();

-- Lo que ya estaba en "Mis colecciones" se copia a Guardados en fix-v2-tanda4-b.sql (Postgres no deja usar
-- un valor de enum recién agregado en la misma transacción).

-- ── 2. Onboarding: qué suscripción le interesa (Gratis / Karai Campo / Organización) ─────────
alter table public.profiles add column if not exists subscription_interest text
  check (subscription_interest is null or subscription_interest in ('free', 'karai_campo', 'organizacion'));

notify pgrst, 'reload schema';
