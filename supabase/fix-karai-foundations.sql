-- Karai — cimientos (Sprint 1, sin IA todavia): identidad de telefono, cuota de uso,
-- consentimientos y el historial de conversacion. Ver docs/KARAI-DIAGNOSTICO-SPRINT-1.md.
--
-- Diseno de acceso: estas tablas quedan con RLS activado y SIN policies para anon/authenticated.
-- Todo el acceso pasa por rutas server (web/app/api/karai/*) usando el service role, despues de
-- validar el JWT del usuario a mano — igual criterio que web/app/api/delete-account/route.ts.
-- Motivo (KARAI_CONTEXTO_MAESTRO.md secc. 7.2 y 19): "no colocar autorizacion, aislamiento o
-- validacion unicamente dentro del LLM" y "toda accion sensible debe quedar registrada y ser
-- auditable" — mas facil de garantizar centralizando el acceso en el backend que confiando en
-- policies de RLS abiertas al cliente.

create table phone_identities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  phone_e164 text not null unique,
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index phone_identities_profile_idx on phone_identities (profile_id);

create type karai_consent_status as enum ('granted', 'revoked');

create table consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  status karai_consent_status not null default 'granted',
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index consents_profile_idx on consents (profile_id, consent_type);

create type karai_channel as enum ('web', 'whatsapp');

create table usage_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  channel karai_channel not null,
  interaction_type text not null default 'text',
  tokens_used integer,
  created_at timestamptz not null default now()
);

-- Cuota diaria: se cuenta con un count(*) sobre esta tabla filtrado por profile_id + created_at,
-- no con un contador aparte — mas simple de auditar y de resetear no hace falta (rueda con el reloj).
create index usage_ledger_profile_created_idx on usage_ledger (profile_id, created_at desc);
create index usage_ledger_org_created_idx on usage_ledger (organization_id, created_at desc) where organization_id is not null;

create table conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  channel karai_channel not null,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index conversations_profile_idx on conversations (profile_id, last_message_at desc);

create type karai_message_role as enum ('user', 'assistant', 'system');

create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role karai_message_role not null,
  content text not null,
  scope_category text,
  tokens_used integer,
  created_at timestamptz not null default now()
);

create index conversation_messages_conversation_idx on conversation_messages (conversation_id, created_at);

alter table phone_identities enable row level security;
alter table consents enable row level security;
alter table usage_ledger enable row level security;
alter table conversations enable row level security;
alter table conversation_messages enable row level security;

notify pgrst, 'reload schema';
