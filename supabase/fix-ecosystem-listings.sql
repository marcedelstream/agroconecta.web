-- Ficha única de Ecosistema (empleo/clasificado/curso) — boceto 4f del rediseño mobile.
-- Un solo molde de datos para las tres categorías; el admin carga desde el panel (a construir
-- en web/app/admin) y la app mobile ya sabe leerlas vía fetchEcosystemListings() /
-- fetchEcosystemListingById() en mobile/lib/supabase-repositories.ts.
--
-- "Remates Online" no está acá: ya tiene contenido real propio vía posts (contentType
-- 'auction') + video/[id].tsx, no es un listado de este tipo.

create type ecosystem_listing_kind as enum ('empleo', 'clasificado', 'curso');

create table if not exists public.ecosystem_listings (
  id uuid primary key default gen_random_uuid(),
  slug text,
  kind ecosystem_listing_kind not null,
  title text not null,
  location text not null,
  modality text not null,
  description text not null,
  image_url text,
  category_label text not null,
  publisher_name text not null,
  contact_url text,
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.ecosystem_listings enable row level security;

create policy "public can read active ecosystem listings" on public.ecosystem_listings
  for select using (is_active = true);

-- Datos de ejemplo para ver el rediseño con contenido real mientras se construye el panel
-- admin. Números de contacto son ficticios (formato +595 de Paraguay) — reemplazar antes
-- de mostrarle esto a un usuario real.
insert into public.ecosystem_listings
  (kind, title, location, modality, description, image_url, category_label, publisher_name, contact_url, published_at)
values
  (
    'empleo',
    'Capataz de estancia ganadera',
    'San Pedro', 'Presencial',
    'Buscamos capataz con experiencia en manejo de rodeo de cría, control sanitario y coordinación de peones. Se ofrece vivienda en el establecimiento y salario acorde a experiencia.',
    null, 'Ganadería', 'Estancia Ykua Pyahu', 'https://wa.me/595981234501',
    now() - interval '3 days'
  ),
  (
    'empleo',
    'Técnico/a en inseminación artificial bovina',
    'Itapúa', 'Presencial',
    'Genética del Sur busca técnico con curso de IA certificado para trabajar en campaña de servicio en varios establecimientos de la zona sur. Movilidad propia excluyente.',
    null, 'Ganadería', 'Genética del Sur S.R.L.', 'https://wa.me/595981234502',
    now() - interval '6 days'
  ),
  (
    'empleo',
    'Administrador/a de establecimiento agrícola',
    'Alto Paraná', 'Presencial',
    'Empresa agrícola familiar busca administrador/a para la campaña de soja y maíz: gestión de personal de campo, insumos y logística de cosecha.',
    null, 'Agricultura', 'Agropecuaria Yguazú S.A.', 'https://wa.me/595981234503',
    now() - interval '1 day'
  ),
  (
    'empleo',
    'Ingeniero/a Agrónomo/a — asesoría a productores',
    'Caaguazú', 'Media jornada',
    'Cooperativa agrícola busca ingeniero/a agrónomo/a para asistencia técnica a socios productores de rubros de renta. Se valora experiencia en agricultura de conservación.',
    null, 'Agricultura', 'Cooperativa Agrícola del Este', 'https://wa.me/595981234504',
    now() - interval '9 days'
  ),

  (
    'clasificado',
    'Tractor John Deere 6110J',
    'Itapúa', 'Usado',
    '4.200 horas de uso, mantenimiento al día y pala frontal incluida. Disponible para ver en el establecimiento durante la semana.',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    'Maquinaria', 'Agro Sur S.A.', 'https://wa.me/595981234505',
    now() - interval '2 days'
  ),
  (
    'clasificado',
    'Sembradora Semeato Personale Drill 13',
    'Caaguazú', 'Usado',
    '13 líneas, sistema de siembra directa, discos y cuchillas cambiados esta temporada. Lista para la próxima siembra.',
    null, 'Maquinaria', 'Particular — Ramón Duarte', 'https://wa.me/595981234506',
    now() - interval '4 days'
  ),
  (
    'clasificado',
    '50 vaquillas Brangus preñadas',
    'San Pedro', 'Lote completo',
    'Vaquillas de 24 a 30 meses, servicio controlado, garantía de preñez con tacto reciente. Se puede fraccionar el lote.',
    null, 'Ganadería', 'Estancia Ykua Pyahu', 'https://wa.me/595981234507',
    now() - interval '5 days'
  ),
  (
    'clasificado',
    'Fardera New Holland 570',
    'Guairá', 'Usado',
    'Enfardadora en buen estado general, motor y rodados revisados. Se entrega con manual y repuestos de reserva.',
    null, 'Maquinaria', 'Agropecuaria Litoral', 'https://wa.me/595981234508',
    now() - interval '8 days'
  ),

  (
    'curso',
    'Sanidad animal aplicada',
    'Online', '6 semanas',
    'Curso práctico de sanidad animal para productores y técnicos: prevención, diagnóstico a campo y protocolos de tratamiento. Certificado al finalizar.',
    null, 'Capacitación', 'Instituto Agropecuario Paraguayo', 'https://wa.me/595981234509',
    now() - interval '10 days'
  ),
  (
    'curso',
    'Manejo de pasturas en época seca',
    'Online', '4 semanas',
    'Rotación, reservas forrajeras y suplementación estratégica para sostener la carga animal durante la seca. Pensado para establecimientos del norte del país.',
    null, 'Ganadería', 'Capacitación Rural PY', 'https://wa.me/595981234510',
    now() - interval '12 days'
  ),
  (
    'curso',
    'Agricultura de precisión con drones',
    'Asunción', '3 días',
    'Taller presencial de aplicación de drones para monitoreo de cultivos: mapeo, detección temprana de plagas y análisis de rendimiento.',
    null, 'Tecnología', 'Centro de Formación Agro Digital', 'https://wa.me/595981234511',
    now() - interval '2 days'
  ),
  (
    'curso',
    'Buenas prácticas en bienestar animal',
    'Online', '2 semanas',
    'Curso corto orientado a productores y encargados de establecimiento sobre manejo con bajo estrés animal, previo a normativas de exportación.',
    null, 'Ganadería', 'Instituto Agropecuario Paraguayo', 'https://wa.me/595981234512',
    now() - interval '15 days'
  );

notify pgrst, 'reload schema';
