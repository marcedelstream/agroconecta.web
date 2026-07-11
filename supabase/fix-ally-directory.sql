-- Directorio de Aliados: empresas/organizaciones que pagan un fee anual para sostener la
-- plataforma gratuita. Es independiente de si publican noticias o no (a diferencia del
-- listado de "Organizaciones" que sí lo requiere) — un Aliado paga y aparece igual.
--
-- ally_plan nulo = la organización no es Aliado. commercial_status (ya existente) sigue
-- gobernando si aparece activo/vencido/pausado, igual que para el resto de la plataforma.
-- plan_started_at (ya existente) se reusa para mostrar "Aliado desde [fecha]".

create type ally_plan as enum ('semilla', 'cosecha');
create type ally_category as enum (
  'agricultura', 'ganaderia', 'servicios', 'medios',
  'instituciones', 'insumos_maquinaria', 'tecnologia', 'otros'
);

alter table public.organizations
  add column if not exists ally_plan ally_plan,
  add column if not exists ally_category ally_category,
  add column if not exists ally_founder boolean not null default false,
  add column if not exists contact_phone text;

notify pgrst, 'reload schema';
