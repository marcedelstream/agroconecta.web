-- Permite elegir en qué sección de la app se muestra cada banner (Inicio, Noticia,
-- Precios, Videos), en vez de mostrar todos los banners activos en todos lados.
-- Los banners existentes quedan visibles en todas las secciones (comportamiento actual)
-- hasta que el admin los edite y elija una sección específica.

alter table public.ad_campaigns
  add column if not exists placement text[] not null default '{home,article,precios,videos}';

notify pgrst, 'reload schema';
