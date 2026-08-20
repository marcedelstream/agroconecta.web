-- Educación financiera y guías para productores dentro de Cursos (v1.1.0, feature 8) — se
-- distingue de los cursos pagos con un flag simple en vez de un modelo de precio completo,
-- ya que por ahora el único matiz que pidió el equipo es "gratis / no gratis".
-- Correr después de fix-ecosystem-listings.sql (columna aditiva, no rompe si ya se corrió).

alter table public.ecosystem_listings
  add column if not exists is_free boolean not null default false;

insert into public.ecosystem_listings
  (kind, title, location, modality, description, category_label, publisher_name, contact_url, is_free, published_at)
values
  (
    'curso',
    'Educación financiera para productores: primeros pasos',
    'Online', 'Autogestionado',
    'Guía introductoria gratuita sobre manejo de flujo de caja, ahorro y financiamiento agropecuario, pensada para productores que recién empiezan a llevar sus cuentas.',
    'Educación financiera', 'Agroconecta', 'https://wa.me/595986945816', true,
    now() - interval '1 day'
  ),
  (
    'curso',
    'Guía: cómo acceder a crédito agropecuario',
    'Online', 'Descargable',
    'Guía gratuita con los pasos, requisitos y documentación habitual para acceder a líneas de crédito del sector agropecuario en Paraguay.',
    'Educación financiera', 'Agroconecta', 'https://wa.me/595986945816', true,
    now() - interval '3 days'
  );

notify pgrst, 'reload schema';
