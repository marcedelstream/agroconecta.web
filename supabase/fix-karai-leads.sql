-- Karai — leads de oportunidad comercial. El admin NO tiene que poder leer las conversaciones
-- privadas de los usuarios (correccion de diseno pedida por el usuario, 2026-09-01): en vez de
-- exponer la transcripcion completa, cuando el clasificador detecta category='commercial_opportunity'
-- se guarda SOLO el mensaje puntual que disparo la deteccion, no el historial. El admin ve esto,
-- no el resto de la conversacion.

create type karai_lead_status as enum ('new', 'contacted', 'closed');

create table karai_leads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  excerpt text not null,
  status karai_lead_status not null default 'new',
  created_at timestamptz not null default now()
);

create index karai_leads_status_idx on karai_leads (status, created_at desc);

-- Mismo criterio que el resto de las tablas de Karai: RLS activado, sin policies publicas — el
-- admin accede via service role desde /admin/karai, nunca desde el cliente.
alter table karai_leads enable row level security;

notify pgrst, 'reload schema';
