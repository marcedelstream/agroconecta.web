-- Banners de prueba, uno por seccion (Inicio, Precios, Videos, Noticia) para poder ver que cada
-- seccion muestra un banner distinto, mas uno que aparece en todos lados. Requiere haber corrido
-- supabase/fix-ad-campaigns-placement.sql antes (agrega la columna placement).
-- Se puede correr mas de una vez sin duplicar (guard por title).

insert into ad_campaigns (title, image_url, placement, target_professions, target_departments, target_categories)
select 'Financia tu rodeo', 'https://picsum.photos/seed/banner-home/640/200', array['home'], array['productor'], array[]::text[], array['ganaderia']
where not exists (select 1 from ad_campaigns where title = 'Financia tu rodeo');

insert into ad_campaigns (title, image_url, placement, target_professions, target_departments, target_categories)
select 'Cotiza tu prestamo agropecuario', 'https://picsum.photos/seed/banner-precios/640/200', array['precios'], array[]::text[], array[]::text[], array[]::text[]
where not exists (select 1 from ad_campaigns where title = 'Cotiza tu prestamo agropecuario');

insert into ad_campaigns (title, image_url, placement, target_professions, target_departments, target_categories)
select 'Mira remates en vivo todas las semanas', 'https://picsum.photos/seed/banner-videos/640/200', array['videos'], array[]::text[], array[]::text[], array[]::text[]
where not exists (select 1 from ad_campaigns where title = 'Mira remates en vivo todas las semanas');

insert into ad_campaigns (title, image_url, placement, target_professions, target_departments, target_categories)
select 'Sanidad animal: consulta a tu veterinario', 'https://picsum.photos/seed/banner-article/640/200', array['article'], array['veterinario','productor'], array[]::text[], array[]::text[]
where not exists (select 1 from ad_campaigns where title = 'Sanidad animal: consulta a tu veterinario');

insert into ad_campaigns (title, image_url, placement, target_professions, target_departments, target_categories)
select 'Semillas para la zafra', 'https://picsum.photos/seed/banner-todas/640/200', array['home','article','precios','videos'], array['productor','agronomo'], array[]::text[], array['agricultura']
where not exists (select 1 from ad_campaigns where title = 'Semillas para la zafra');
