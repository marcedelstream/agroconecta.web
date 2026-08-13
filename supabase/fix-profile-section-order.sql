-- Orden personalizado de las bandas de Inicio ("Ajustar interés" → reordenar, rediseño mobile 2026-08).
-- jsonb en vez de text[] para no tener que migrar el tipo si el front cambia de forma en el futuro.

alter table public.profiles
  add column if not exists section_order jsonb;

notify pgrst, 'reload schema';
