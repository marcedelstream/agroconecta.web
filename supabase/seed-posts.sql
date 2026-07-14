-- Noticias, videos y remates de prueba — cubre las 6 categorias, los 3 content_type (article,
-- video, auction), un post destacado para el hero del Home, y contenido "en vivo" tanto para un
-- remate como para un video normal (para probar el boton EN VIVO del header en los dos casos).
-- Corre despues de seed.sql (necesita las organizaciones ya cargadas). Se puede correr mas de una
-- vez sin duplicar (on conflict por slug, que es unico).

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, is_important, is_highlighted, image_url, published_at)
select id,
  'Paraguay registra record historico en exportacion de carne bovina',
  'paraguay-registra-record-historico-en-exportacion-de-carne-bovina',
  'El pais alcanzo cifras sin precedentes, consolidandose como uno de los principales exportadores de la region.',
  'El sector ganadero paraguayo continua consolidandose como uno de los motores de la economia nacional. Los datos mas recientes reflejan crecimiento sostenido, mejores precios y una demanda internacional firme.',
  'ganaderia', 'article', 'published', true, true,
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
  now() - interval '1 day'
from organizations where slug = 'agroconecta-medios'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, is_important, image_url, published_at)
select id,
  'SENACSA habilita nuevos frigorificos para exportacion a la UE',
  'senacsa-habilita-nuevos-frigorificos-para-exportacion-a-la-ue',
  'Tres establecimientos mas cumplen con los estandares requeridos por el mercado europeo.',
  'El Servicio Nacional de Calidad y Salud Animal informo nuevas habilitaciones para exportacion, fortaleciendo la posicion sanitaria del Paraguay.',
  'institucional', 'institutional_notice', 'published', true,
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800',
  now() - interval '2 days'
from organizations where slug = 'senacsa'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, published_at)
select id,
  'La soja paraguaya cierra la zafra con rendimientos por encima del promedio',
  'la-soja-paraguaya-cierra-la-zafra-con-rendimientos-por-encima-del-promedio',
  'Productores del este del pais reportan un cierre de campana mejor de lo esperado.',
  'La zafra sojera 2025/2026 cierra con rendimientos que superan el promedio de los ultimos cinco anos, gracias a condiciones climaticas favorables y mayor adopcion de tecnologia.',
  'agricultura', 'article', 'published',
  'https://picsum.photos/seed/agroconecta-soja/800/450',
  now() - interval '3 days'
from organizations where slug = 'campo-agropecuario'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, published_at)
select id,
  'Alerta meteorologica: heladas tardias afectarian al este del pais',
  'alerta-meteorologica-heladas-tardias-afectarian-al-este-del-pais',
  'Meteorologos recomiendan a los productores tomar recaudos en las proximas 72 horas.',
  'Un frente frio inusual para la epoca podria generar heladas en zonas del este paraguayo. Se recomienda a los productores proteger cultivos sensibles.',
  'clima', 'article', 'published',
  'https://picsum.photos/seed/agroconecta-clima/800/450',
  now() - interval '4 hours'
from organizations where slug = 'abc-rural'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, published_at)
select id,
  'El precio del novillo gordo sube por tercera semana consecutiva',
  'el-precio-del-novillo-gordo-sube-por-tercera-semana-consecutiva',
  'La demanda sostenida impulsa una nueva suba en el mercado de Villeta.',
  'El novillo gordo acumula tres semanas de subas consecutivas en el mercado de Villeta, impulsado por la demanda de frigorificos exportadores.',
  'mercados', 'article', 'published',
  'https://picsum.photos/seed/agroconecta-mercados/800/450',
  now() - interval '6 hours'
from organizations where slug = 'poder-agropecuario'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, published_at)
select id,
  'Agricultura de precision: cada vez mas productores paraguayos usan drones',
  'agricultura-de-precision-cada-vez-mas-productores-paraguayos-usan-drones',
  'La adopcion de tecnologia crece en el sector, con foco en monitoreo de cultivos y aplicacion focalizada.',
  'El uso de drones para monitoreo de cultivos y aplicacion focalizada de insumos crece entre productores paraguayos, con ahorro de costos e insumos.',
  'tecnologia', 'article', 'published',
  'https://picsum.photos/seed/agroconecta-tech/800/450',
  now() - interval '1 day'
from organizations where slug = 'agroconecta-medios'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, published_at)
select id,
  'ARP anuncia la agenda de la Expo Rural 2026',
  'arp-anuncia-la-agenda-de-la-expo-rural-2026',
  'La Asociacion Rural del Paraguay confirmo fechas, expositores y actividades centrales.',
  'La Expo Rural 2026 tendra jornadas tecnicas, remates y actividades para toda la familia. La ARP confirmo el cronograma completo.',
  'ganaderia', 'article', 'published',
  'https://picsum.photos/seed/agroconecta-expo/800/450',
  now() - interval '5 days'
from organizations where slug = 'arp'
on conflict (slug) do nothing;

-- Video normal (no remate) marcado EN VIVO — prueba el boton EN VIVO del header para content_type='video'.
insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, is_important, image_url, youtube_url, auction_status, published_at)
select id,
  'En vivo: recorrido por el campo ganadero de Presidente Hayes',
  'en-vivo-recorrido-por-el-campo-ganadero-de-presidente-hayes',
  'Transmision en directo desde un establecimiento ganadero modelo.',
  'Recorrido en vivo por instalaciones y manejo de rodeo en un establecimiento de Presidente Hayes.',
  'ganaderia', 'video', 'published', true,
  'https://picsum.photos/seed/agroconecta-vivo/800/450',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'live',
  now()
from organizations where slug = 'remates-paraguay'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, youtube_url, published_at)
select id,
  'Como preparar el suelo para la proxima siembra',
  'como-preparar-el-suelo-para-la-proxima-siembra',
  'Guia practica de manejo de suelo antes de la siembra.',
  'Especialistas explican los pasos clave para preparar el suelo y maximizar el potencial de la proxima siembra.',
  'agricultura', 'video', 'published',
  'https://picsum.photos/seed/agroconecta-suelo/800/450',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  now() - interval '2 days'
from organizations where slug = 'campo-agropecuario'
on conflict (slug) do nothing;

insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, youtube_url, published_at)
select id,
  'Nuevas maquinarias agricolas presentadas en Paraguay',
  'nuevas-maquinarias-agricolas-presentadas-en-paraguay',
  'Repaso de las novedades presentadas en la ultima muestra de maquinaria agricola.',
  'Fabricantes presentaron sus ultimas novedades en maquinaria agricola, con foco en eficiencia y automatizacion.',
  'tecnologia', 'video', 'published',
  'https://picsum.photos/seed/agroconecta-maquinaria/800/450',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  now() - interval '3 days'
from organizations where slug = 'agroconecta-medios'
on conflict (slug) do nothing;

-- Remate en vivo.
insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, is_important, image_url, youtube_url, auction_status, starts_at, published_at)
select id,
  'Remate Brangus Primavera 2026 - transmision en vivo',
  'remate-brangus-primavera-2026-transmision-en-vivo',
  'Acceso directo al remate destacado de la Asociacion Paraguaya de Brangus.',
  'Remate destacado con transmision embebida desde YouTube dentro de Agroconecta.',
  'ganaderia', 'auction', 'published', true,
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'live',
  now() + interval '2 hours',
  now()
from organizations where slug = 'asociacion-brangus'
on conflict (slug) do nothing;

-- Remate proximo (no en vivo todavia) — prueba el badge "PROXIMO" en Videos.
insert into posts (organization_id, title, slug, summary, content, category, content_type, editorial_status, image_url, youtube_url, auction_status, starts_at, published_at)
select id,
  'Remate Nelore Otono 2026 - proximamente',
  'remate-nelore-otono-2026-proximamente',
  'Remate de la raza Nelore, con transmision en vivo el dia del evento.',
  'Remate programado de reproductores Nelore. La transmision en vivo se habilita el dia del remate.',
  'ganaderia', 'auction', 'published',
  'https://picsum.photos/seed/agroconecta-nelore/800/450',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'upcoming',
  now() + interval '5 days',
  now() - interval '1 day'
from organizations where slug = 'remates-paraguay'
on conflict (slug) do nothing;
