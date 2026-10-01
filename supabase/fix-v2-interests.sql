-- Agroconecta v2 — intereses manejables desde el panel (/admin/intereses).
-- Idempotente. NO correr en producción sin confirmación de Marce.
--
-- Antes las opciones del onboarding (rubros, qué produce, para qué usa la app, escala) estaban escritas en
-- el código de la app (mobile/lib/onboarding-v2.ts): sumar una pedía una build nueva. Ahora viven acá; la
-- app las lee al abrir y, si no puede, usa la lista que trae adentro. Lo que elige cada persona se sigue
-- guardando igual (user_profile_facets / user_interests) y lo usa el ranking del feed.
-- Ocultar (is_active = false) en vez de borrar: hay personas que ya eligieron esa opción.

create table if not exists public.interest_options (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('rubro', 'produccion', 'objetivo', 'escala')),
  value text not null check (value ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label text not null,
  -- Solo para 'produccion': el rubro al que pertenece (value de un rubro).
  parent text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kind, value)
);

alter table public.interest_options enable row level security;
drop policy if exists "anyone reads active interest options" on public.interest_options;
create policy "anyone reads active interest options" on public.interest_options for select using (is_active);
-- Sin policies de escritura: se edita solo desde el panel (service role).

insert into public.interest_options (kind, value, label, parent, position) values
  ('rubro', 'agricultura', 'Agricultura', null, 1),
  ('rubro', 'ganaderia', 'Ganadería', null, 2),
  ('rubro', 'horticultura', 'Horticultura', null, 3),
  ('rubro', 'tecnologia', 'Tecnología', null, 4),
  ('rubro', 'mercados', 'Mercados', null, 5),
  ('produccion', 'soja', 'Soja', 'agricultura', 1),
  ('produccion', 'maiz', 'Maíz', 'agricultura', 2),
  ('produccion', 'trigo', 'Trigo', 'agricultura', 3),
  ('produccion', 'arroz', 'Arroz', 'agricultura', 4),
  ('produccion', 'sesamo', 'Sésamo', 'agricultura', 5),
  ('produccion', 'chia', 'Chía', 'agricultura', 6),
  ('produccion', 'girasol', 'Girasol', 'agricultura', 7),
  ('produccion', 'cria', 'Cría', 'ganaderia', 1),
  ('produccion', 'invernada', 'Invernada', 'ganaderia', 2),
  ('produccion', 'feedlot', 'Feedlot', 'ganaderia', 3),
  ('produccion', 'tambo', 'Tambo', 'ganaderia', 4),
  ('produccion', 'porcino', 'Porcino', 'ganaderia', 5),
  ('produccion', 'avicola', 'Avícola', 'ganaderia', 6),
  ('produccion', 'hortalizas', 'Hortalizas', 'horticultura', 1),
  ('produccion', 'frutas', 'Frutas', 'horticultura', 2),
  ('produccion', 'invernadero', 'Invernadero', 'horticultura', 3),
  ('produccion', 'drones', 'Drones', 'tecnologia', 1),
  ('produccion', 'agricultura-de-precision', 'Agricultura de precisión', 'tecnologia', 2),
  ('produccion', 'riego', 'Riego', 'tecnologia', 3),
  ('produccion', 'granos', 'Granos', 'mercados', 1),
  ('produccion', 'hacienda', 'Hacienda', 'mercados', 2),
  ('produccion', 'insumos', 'Insumos', 'mercados', 3),
  ('objetivo', 'informarme', 'Informarme', null, 1),
  ('objetivo', 'precios', 'Ver precios', null, 2),
  ('objetivo', 'capacitarme', 'Capacitarme', null, 3),
  ('objetivo', 'comprar-vender', 'Comprar y vender', null, 4),
  ('objetivo', 'empleo', 'Buscar empleo', null, 5),
  ('objetivo', 'eventos-remates', 'Eventos y remates', null, 6),
  ('escala', 'productor-chico', 'Productor chico', null, 1),
  ('escala', 'productor-mediano', 'Productor mediano', null, 2),
  ('escala', 'productor-grande', 'Productor grande', null, 3),
  ('escala', 'tecnico', 'Técnico', null, 4),
  ('escala', 'empresa', 'Empresa', null, 5),
  ('escala', 'estudiante', 'Estudiante', null, 6)
on conflict (kind, value) do nothing;

notify pgrst, 'reload schema';
