-- Karai — datos de finca por usuario + base de conocimiento admin.
--
-- farm_profile es DISTINTA al resto de las tablas de Karai: acá el usuario SI necesita leer y
-- editar su propia fila desde /karai/mis-datos, asi que lleva policy de RLS real
-- (auth.uid() = profile_id), no "solo service role" como usage_ledger/conversations/etc.
-- Esto es intencional: "el usuario tiene que poder ver lo que Karai recopila de el (y editarlo),
-- nunca extraer datos de otros clientes" (pedido explicito 2026-09-01).

create table farm_profile (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table farm_profile enable row level security;

create policy "users manage own farm profile" on farm_profile
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Base de conocimiento admin: links/documentos de confianza que Karai usa cuando Agroconecta no
-- tiene el dato en posts/market_prices. Placeholder simple (sin embeddings/RAG todavia) — se
-- inyecta como texto en el contexto (lib/karai/context.ts), truncado por longitud.

create type karai_knowledge_kind as enum ('link', 'document');

create table karai_knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  kind karai_knowledge_kind not null,
  title text not null,
  url text,
  content text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index karai_knowledge_sources_active_idx on karai_knowledge_sources (is_active, created_at desc);

-- Mismo criterio que el resto de la infraestructura de Karai (no farm_profile): solo el admin
-- (service role) carga y lee esto, el cliente nunca accede directo.
alter table karai_knowledge_sources enable row level security;

notify pgrst, 'reload schema';
