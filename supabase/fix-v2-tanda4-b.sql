-- Agroconecta v2 — tanda 4, parte B. Correr DESPUÉS de fix-v2-tanda4.sql (en otra ejecución).
-- Idempotente. Copia a Guardados los libros que ya estaban en "Mis colecciones".
insert into public.content_saves (user_id, source, source_id, created_at)
  select ul.user_id, 'library'::public.feed_source, ul.item_id::text, ul.added_at from public.user_library ul
  on conflict do nothing;
