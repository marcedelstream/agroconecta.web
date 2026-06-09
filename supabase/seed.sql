insert into organizations (slug, name, description, type, is_verified, commercial_status, plan_name)
values
  ('agroconecta-medios', 'Agroconecta Medios', 'Noticias, analisis y tendencias del agro desde el ecosistema Agroconecta.', 'media', true, 'active', 'Interno'),
  ('poder-agropecuario', 'Poder Agropecuario', 'Medio especializado en noticias y analisis del sector agropecuario paraguayo.', 'media', true, 'active', 'Medio aliado'),
  ('campo-agropecuario', 'Campo Agropecuario', 'El referente digital del campo paraguayo con cobertura nacional.', 'media', true, 'active', 'Medio aliado'),
  ('abc-rural', 'ABC Rural', 'Seccion agropecuaria de ABC Color, el diario de mayor circulacion del pais.', 'media', true, 'trial', 'Piloto'),
  ('asociacion-brangus', 'Asociacion Paraguaya de Brangus', 'Comunicados, remates, jornadas tecnicas y novedades oficiales de la raza Brangus.', 'asociacion', true, 'active', 'Asociacion Pro'),
  ('arp', 'Asociacion Rural del Paraguay', 'Gremio referente de la produccion ganadera y exposiciones rurales del Paraguay.', 'gremio', true, 'active', 'Institucional'),
  ('senacsa', 'SENACSA', 'Servicio Nacional de Calidad y Salud Animal. Organismo oficial del Estado.', 'institucion', true, 'active', 'Institucional'),
  ('mag', 'MAG', 'Ministerio de Agricultura y Ganaderia de la Republica del Paraguay.', 'institucion', true, 'active', 'Institucional'),
  ('senave', 'SENAVE', 'Servicio Nacional de Calidad y Sanidad Vegetal y de Semillas.', 'institucion', true, 'active', 'Institucional'),
  ('remates-paraguay', 'Remates Paraguay', 'Agenda y transmision de remates ganaderos en vivo desde todo el pais.', 'rematadora', true, 'trial', 'Remates')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  is_verified = excluded.is_verified,
  commercial_status = excluded.commercial_status,
  plan_name = excluded.plan_name;

insert into posts (organization_id, title, summary, content, category, content_type, editorial_status, is_important, is_highlighted, image_url, published_at)
select id, 'Paraguay registra record historico en exportacion de carne bovina',
  'El pais alcanzo cifras sin precedentes, consolidandose como uno de los principales exportadores de la region.',
  'El sector ganadero paraguayo continua consolidandose como uno de los motores de la economia nacional. Los datos mas recientes reflejan crecimiento sostenido, mejores precios y una demanda internacional firme.',
  'ganaderia', 'article', 'published', true, true,
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
  now() - interval '1 day'
from organizations where slug = 'agroconecta-medios';

insert into posts (organization_id, title, summary, content, category, content_type, editorial_status, is_important, image_url, published_at)
select id, 'SENACSA habilita nuevos frigorificos para exportacion a la UE',
  'Tres establecimientos mas cumplen con los estandares requeridos por el mercado europeo.',
  'El Servicio Nacional de Calidad y Salud Animal informo nuevas habilitaciones para exportacion, fortaleciendo la posicion sanitaria del Paraguay.',
  'institucional', 'institutional_notice', 'published', true,
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800',
  now() - interval '2 days'
from organizations where slug = 'senacsa';

insert into posts (organization_id, title, summary, content, category, content_type, editorial_status, is_important, image_url, youtube_url, auction_status, starts_at, published_at)
select id, 'Remate Brangus Primavera 2026 - transmision en vivo',
  'Acceso directo al remate destacado de la Asociacion Paraguaya de Brangus.',
  'Remate destacado con transmision embebida desde YouTube dentro de Agroconecta.',
  'ganaderia', 'auction', 'published', true,
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900',
  'https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw',
  'live',
  now() + interval '2 hours',
  now()
from organizations where slug = 'asociacion-brangus';

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
values
  ('cattle', 'Novillo Gordo', 'Mercado Villeta', 'PYG', 'Gs/kg', 12850, 150, 1.18),
  ('cattle', 'Vaca Gorda', 'Mercado Villeta', 'PYG', 'Gs/kg', 11200, -50, -0.44),
  ('cattle', 'Vaquillona', 'Mercado Villeta', 'PYG', 'Gs/kg', 11800, 200, 1.72),
  ('international', 'Soja', 'CBOT Chicago', 'USD', 'USD/ton', 385.50, 4.25, 1.11),
  ('international', 'Maiz', 'CBOT Chicago', 'USD', 'USD/ton', 178.30, -2.10, -1.16),
  ('international', 'Trigo', 'CBOT Chicago', 'USD', 'USD/ton', 245.80, 3.50, 1.44);

insert into ad_campaigns (title, image_url, target_professions, target_departments, target_categories)
values
  ('Financia tu rodeo', 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/ganaderia-creditos.png', array['productor'], array[]::text[], array['ganaderia']),
  ('Semillas para la zafra', 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/semillas-zafra.png', array['productor','agronomo'], array[]::text[], array['agricultura']),
  ('Sanidad animal', 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/sanidad-animal.png', array['veterinario','productor'], array[]::text[], array['ganaderia']);
