-- Karai — metadatos y trazabilidad de la base de conocimiento (docs/KARAI-PLAN-ENTRENAMIENTO-Y-FUENTES.md
-- secc. 4.2 "Registro de fuentes" y secc. 3 "Orden oficial de autoridad de las fuentes").
--
-- Antes, una fuente era solo texto + on/off (is_active). Ahora cada fuente declara quién la cargó,
-- con qué nivel de autoridad, sobre qué tema/geografía, y desde/hasta cuándo es válida — para poder
-- responder "esta fuente vale hasta tal fecha" y para dejar de usar una fuente vencida sin borrar el
-- historial de qué se citó en el pasado.

-- Niveles B/C/D del documento (A es Agroconecta mismo — posts/market_prices/events, no pasa por
-- este catálogo; E/F — web abierta y memoria del modelo — tampoco se cargan acá).
-- Postgres no tiene "CREATE TYPE IF NOT EXISTS" — el DO block evita el error si el script se
-- reintenta después de una corrida parcial.
do $$ begin
  create type karai_source_level as enum ('official_document', 'official_site', 'social_media');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type karai_source_status as enum ('pendiente', 'aprobado', 'vencido', 'retirado');
exception when duplicate_object then null;
end $$;

alter table karai_knowledge_sources
  add column if not exists publisher text,
  add column if not exists source_level karai_source_level,
  add column if not exists topic text,
  add column if not exists geography text not null default 'Paraguay',
  add column if not exists issued_at date,
  add column if not exists reviewed_at date,
  add column if not exists expires_at date,
  add column if not exists verification_notes text,
  add column if not exists status karai_source_status not null default 'pendiente';

-- Migra el on/off que ya existía a los estados nuevos, después saca la columna vieja. El CASE
-- necesita el cast explícito: Postgres no infiere el tipo enum de las ramas del CASE solo.
update karai_knowledge_sources
  set status = case when is_active then 'aprobado' else 'retirado' end::karai_source_status;
alter table karai_knowledge_sources drop column if exists is_active;

create index karai_knowledge_sources_status_idx on karai_knowledge_sources (status, expires_at);

notify pgrst, 'reload schema';
