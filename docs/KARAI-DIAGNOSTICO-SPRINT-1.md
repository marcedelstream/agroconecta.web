# Karai — Diagnóstico de arquitectura y Sprint 1 propuesto

> Cruce entre `KARAI_CONTEXTO_MAESTRO.md` (Marcelo Escobar, definición estratégica) y el estado real del
> repo `AGROCONECTA APP/` al 26/08/2026. No incluye código — es la base para decidir qué se construye primero.

## Resumen ejecutivo

Agroconecta hoy es una plataforma **editorial + marketplace** (noticias, precios, eventos externos,
directorio de organizaciones) con autenticación simple. **Ninguno de los componentes específicos de Karai
descritos en el contexto maestro existe todavía** — ni el adaptador de WhatsApp, ni el modelo de datos de
finca, ni el motor de oportunidades, ni control de cuota/costos, ni RAG. Es una base limpia: no hay que
migrar nada mal hecho, hay que construir encima de una identidad y un contenido que sí sirven.

## 1. Qué ya existe y es reutilizable

| Pieza | Dónde | Cómo ayuda a Karai |
|---|---|---|
| Identidad de usuario | `profiles` (1:1 con `auth.users`), incluye `phone` (texto libre, **sin verificar**) | Punto de partida para `phone_identities`, pero falta la tabla dedicada + verificación |
| Multi-tenant embrionario | `organizations` + `organization_members` (roles `agro_admin`/`org_admin`/`org_editor`) | El patrón tenant + membership + rol ya existe — pensado para editorial, no para fincas, pero reutilizable como referencia |
| RLS con patrón claro | Toda tabla usa `auth.uid() = owner_id` | Mismo patrón aplicable a tablas nuevas de Karai |
| Contenido fuente para "Información" | `posts` (noticias unificadas), `market_prices`, eventos externos vía `mobile/lib/supabase-events.ts` | Es exactamente la data que la capacidad "Información" del doc maestro necesita — se puede consultar directo, no hace falta RAG con embeddings el día 1 (aplica el punto 6.3 del doc maestro: consultas simples → código tradicional) |
| Panel admin | `web/app/admin/(dashboard)/` — publicaciones, organizaciones, precios, banners, eventos | Base natural para agregar una sección "Karai" en vez de construir un panel nuevo |
| Planes comerciales | `organizations.plan_name` / `commercial_status` (Aliado Semilla/Cosecha) | Sirve de anclaje para Karai Teams/Enterprise, como ya quedó definido en `KARAI-MODELO-NEGOCIO.md` |
| Cero deuda técnica de IA | Ningún SDK de OpenAI/Anthropic importado en `mobile/` ni `web/` | El patrón `AIProvider` desacoplado que pide el doc maestro (sección 8.1) se puede aplicar limpio desde el día 1, no hay nada que desarmar |

**Convención a decidir:** el repo no usa Supabase CLI — no hay `supabase/functions/` ni `config.toml`, todo
se aplica a mano vía SQL Editor (`schema.sql` + `fix-*.sql`). Hay que decidir si Karai adopta CLI/migraciones
versionadas o sigue el patrón manual existente (afecta cómo se entrega cada pieza).

## 2. Qué falta — componentes sugeridos (sección 10 del doc maestro)

| Componente | Estado |
|---|---|
| Adaptador de WhatsApp | ⛔ No existe |
| Autenticación y vinculación de cuentas (teléfono↔perfil) | ⛔ No existe — `profiles.phone` no está verificado |
| Servicio de identidad, roles y permisos de finca | ⛔ No existe — los roles actuales son editoriales |
| Orquestador de conversaciones | ⛔ No existe |
| Clasificador de intención y alcance | ⛔ No existe |
| Motor de políticas y límites (cuota, rate limit) | ⛔ No existe |
| Router de modelos | ⛔ No existe |
| Registro estructurado de fincas | ⛔ No existe |
| Capa RAG de Agroconecta | 🟡 Parcial — la fuente (`posts`, `market_prices`) existe, falta indexado/recuperación |
| Motor de oportunidades | ⛔ No existe |
| Servicio de consentimientos | ⛔ No existe |
| Auditoría y observabilidad | ⛔ No existe |
| Panel Karai dentro del admin | 🟡 Parcial — el panel existe, falta la sección |
| Facturación y planes | 🟡 Parcial — existe el dato (`plan_name`), no la pasarela |

## 3. Qué falta — entidades (sección 12 del doc maestro)

| Entidad | Estado |
|---|---|
| users | 🟡 `profiles` cumple el rol |
| phone_identities | ⛔ |
| organizations | ✅ |
| memberships | ✅ `organization_members` (rol editorial, no de finca) |
| farms / farm_members / fields_or_lots / crops / livestock_groups / animals / farm_events / inventories / tasks_and_reminders | ⛔ ninguna existe |
| conversations / conversation_summaries | ⛔ |
| usage_ledger | ⛔ |
| subscriptions | 🟡 `user_subscriptions` existe pero es "seguir organización", no un plan pago |
| consents | ⛔ |
| opportunity_intents / opportunity_matches | ⛔ |
| audit_logs | ⛔ |
| knowledge_sources | 🟡 implícito en `posts`/`organizations`, no modelado explícito |
| knowledge_documents | ⛔ |

## 4. Riesgos del doc maestro — estado actual

- **Riesgo 3 (dependencia de proveedor):** el más fácil de resolver bien — no hay ningún SDK de IA acoplado
  todavía en ningún lado. Se puede construir el adaptador `AIProvider` desde el primer commit, sin deuda que
  desarmar.
- **Riesgo 1 (costos/alcance):** nada construido — clasificador y límites arrancan de cero.
- **Riesgo 2 (privacidad):** el patrón RLS existe pero solo protege datos editoriales; para datos de finca
  (mucho más sensibles) hay que diseñarlo con el nivel de rigor que pide la sección 7, no reusar tal cual.

## 5. Sprint 1 propuesto — cimientos, sin IA todavía

Construir la sección 15 completa del doc maestro de una sola vez es demasiado para un sprint 1. Siguiendo el
principio del propio documento ("diseñar primero el camino más pequeño que permita validar el MVP" y "no
colocar autorización únicamente dentro del LLM"), el sprint 1 no incluye ni una llamada a un modelo de
lenguaje todavía — es pura columna vertebral de identidad y seguridad:

1. **`phone_identities`** — tabla + flujo de vinculación número↔`profiles`. Ya lo habíamos marcado como
   bloqueante para que la cuota por tier tenga sentido.
2. **`usage_ledger`** + motor de límites básico — aunque sea solo contando mensajes sin cobrar todavía, para
   no lanzar sin control de costo desde el día 1.
3. **`consents`** — aunque el motor de oportunidades es fase 4, conviene diseñar la tabla y el patrón de
   consentimiento específico/revocable ya, porque insertarlo retroactivamente sobre datos ya cargados es
   mucho más difícil.
4. **Adaptador de WhatsApp mínimo** — webhook que recibe, valida firma, identifica el número, responde "hola,
   en construcción". Sin clasificador ni LLM todavía: valida que el canal completo funciona de punta a punta.
5. **Clasificador de alcance** (sección 6.1 del doc maestro, la capa `out_of_scope`) — es barato de construir
   y es la primera línea de defensa de costos; puede arrancar con reglas simples o un modelo económico.
6. **Sección "Karai" en el panel admin** — aunque sea de solo lectura, para ver mensajes y uso real.

**Explícitamente fuera del sprint 1:** farms/lots/crops/livestock (fase 2 completa), RAG con embeddings
(arranca con queries directas a `posts`/`market_prices`), motor de oportunidades (fase 4), router
multi-modelo (un solo proveedor alcanza para validar).

## 6. Decisiones pendientes antes de escribir código

Ya resueltas en conversación previa: Karai vive dentro de este monorepo; mantiene consulta + carga de campo
desde el arranque; la cuota se ata a cuenta/organización real (no al número de WhatsApp suelto).

Pendientes:
- ¿Supabase CLI + migraciones versionadas, o seguir el patrón manual `fix-*.sql` que ya usa el repo?
- ¿Se mantiene OpenAI (gpt-4o-mini + Whisper), como había quedado definido en el piloto anterior, ahora con
  este alcance más amplio?
- El modelo de roles de finca (owner/admin/técnico/contador/empleado/solo-lectura) es mucho más granular que
  el `app_role` editorial actual — ¿enum nuevo separado, o se extiende el existente?
- ¿`phone_identities` reemplaza a `profiles.phone`, o conviven (uno verificado, uno de contacto)?
