-- Membresía anual individual (botón "+" de publicar, rediseño mobile 2026-08). Sin pago in-app
-- todavía: se activa a mano desde Supabase Studio cuando el equipo confirma el cobro.

alter table public.profiles
  add column if not exists is_member boolean not null default false;

notify pgrst, 'reload schema';
