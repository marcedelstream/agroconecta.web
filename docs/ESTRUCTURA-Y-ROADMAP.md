# Agroconecta — Documento Oficial de Estructura y Roadmap

> Última actualización: 2026-07-03
> Este documento es la fuente de verdad para planificar el trabajo pendiente. Se actualiza cada vez que se cierra o se agrega una fase. Complementa a `CLAUDE.md` (que describe el stack y las convenciones) — acá va el **plan**, no las convenciones.
>
> **Nota de rutas:** las secciones de abajo se escribieron antes de la reorganización del 2026-07-03. Todas las
> rutas de la app móvil (`app/...`, `components/...`, `lib/...`) mencionadas acá son relativas a `mobile/` —
> por ejemplo `lib/types.ts` es hoy `mobile/lib/types.ts`.

---

## 1. Estado real del proyecto (auditado línea por línea, no por memoria)

| Área | Estado | Detalle |
|---|---|---|
| Auth + Onboarding | ✅ Completo | Supabase Auth, 6 pasos, AsyncStorage |
| Feed de noticias | ✅ Completo | Home, detalle, filtros, búsqueda |
| Precios (ganadero + commodities) | ✅ Completo | PYG y USD, tabla `market_prices` |
| Videos / remates | ✅ Completo | YouTube embeds, WebView |
| Ecosistema (plataformas externas) | ✅ Completo | `EcosystemSite` |
| Perfil de usuario | ✅ Completo | Tema, notificaciones, preferencias |
| **Eventos** | ✅ Completo | Lista + detalle + carrusel en home + recordatorios push + mapa. Fuente: Supabase **externo** (`eventosagropy.com`, ver `lib/supabase-events.ts`) |
| **Banners publicitarios** | ⚠️ Parcial | Carrusel funcional (`components/ui/AdBanner.tsx`) leyendo `ad_campaigns`, con segmentación por profesión/depto/categoría. **El `TouchableOpacity` no tiene `onPress`** — hoy es 100% visual, no navega a ningún lado |
| Push notifications | ✅ Completo | Token registrado en `app/_layout.tsx`, tabla `push_tokens`, tap-to-open funcionando |
| Panel admin (web) | ✅ Completo | Publicaciones, organizaciones, precios, banners |
| Deploy web | ✅ Completo | Hostinger + PM2 + nginx + CI/CD GitHub Actions |
| **Cursos** | ❌ No existe | Cero tablas, cero pantallas |
| **Biblioteca digital** | ❌ No existe | Cero tablas, cero pantallas |
| **APK / Build Android** | ⚠️ Falta configurar | `app.json` listo (ícono, splash, `package: com.agroconecta.app`, SDK 55), pero no hay `eas.json` ni build local probado todavía |

### Nota de arquitectura importante
Los **Eventos** viven en un proyecto Supabase **separado** del principal (`eventosagropy.com`). Esto significa que **no se puede** hacer un `JOIN`/FK directo entre `posts` (noticias, en el Supabase principal) y `events` (en el Supabase externo). Cualquier feature que cruce "evento ↔ noticias relacionadas" necesita un campo de **tag manual** (texto libre, no FK), ejemplo `posts.event_tag`.

---

## 2. Feature 1 — Banner de Evento Especial (Hub)

**Objetivo:** un banner en el home que lleva a una página especial de un evento puntual, con programación, noticias relacionadas, etc.

**Lo bueno:** el 80% ya existe. `event/[slug].tsx` ya muestra descripción, speakers, links importantes, mapa, contacto. El tipo `AgroEvent` (`lib/types.ts:240-263`) ya tiene `internalBannerUrl` — pensado justo para esto.

**Falta:**
1. **`onPress` en `AdBanner.tsx`** (línea 79) — hoy el banner es mudo.
2. **Campo de destino en `ad_campaigns`**: agregar columnas para que un banner pueda apuntar a distintos tipos de destino:
   ```sql
   alter table ad_campaigns add column link_type text
     check (link_type in ('event', 'post', 'url', 'course')) default null;
   alter table ad_campaigns add column link_target text; -- slug de evento, id de post, URL externa, id de curso
   ```
3. **Tab "Noticias" dentro de `event/[slug].tsx`**: filtrar `posts` por `category` igual a la del evento, o por un tag manual `event_tag` si se quiere precisión (recomendado agregar `posts.event_tag text` opcional).
4. **Admin web** (`/admin/banners`): selector de tipo de destino (evento / post / URL / curso) al crear un banner.

**Esfuerzo estimado:** 1 sesión corta (~1-2h) porque reutiliza pantallas existentes.

---

### Estado: ✅ código implementado (2026-07-03) — falta aplicar la migración SQL en producción

Se implementó todo lo de arriba:
- `supabase/fix-event-coverage.sql` — columnas `link_type`/`link_target` en `ad_campaigns`, `event_tag` en `posts`, tabla nueva `event_schedule_items`. **Pendiente: correr este script en el SQL Editor de Supabase** (no lo ejecuté yo — es un cambio de infraestructura compartida, lo corre el equipo).
- `components/ui/AdBanner.tsx` — banner clickeable, navega según `link_type` (evento → `/event/[slug]`, post → `/article/[id]`, url → abre en navegador).
- `app/(main)/event/[slug].tsx` — ahora es un **hub dinámico**: hero + título + info básica siempre visibles, y debajo una barra de tabs que **solo aparece si hay contenido extra** cargado para ese evento puntual: "Programa" (si hay `event_schedule_items`) y "Noticias" (si hay posts con `event_tag` = ese slug). Un evento sin cobertura especial se ve exactamente como antes.
- Admin web `/admin/banners` — nuevo campo "Destino del banner" (evento/post/url/curso + valor).
- Admin web `/admin/eventos` (nueva sección en el menú) — cargar/editar el programa de un evento por slug, y etiquetar publicaciones existentes para que aparezcan en la pestaña "Noticias" de ese evento.

**Cómo activar la cobertura de un evento puntual:**
1. Correr `supabase/fix-event-coverage.sql` una vez.
2. En `/admin/eventos`, pegar el slug del evento (de eventosagropy.com) y cargar el programa + etiquetar noticias.
3. En `/admin/banners`, crear/editar el banner con "Destino" = Evento y el mismo slug. Activarlo con el botón "Activar" (usa el `is_active` que ya existía).
4. Para desactivar en cualquier momento: botón "Pausar" en `/admin/banners` — el contenido del evento (programa/noticias) queda guardado para la próxima vez.

**Verificación hecha esta sesión:** `npx tsc --noEmit` limpio en `web/`, `npm run build` de `web/` compila sin errores (incluida la ruta nueva `/admin/eventos`), y los archivos móviles tocados no generan errores nuevos de TypeScript. No se pudo probar visualmente el flujo completo en el navegador porque las páginas de admin requieren login y no hay credenciales de prueba a mano — probarlo con usuario real antes de dar por cerrada la feature.

---

## 3. Feature 2 — Cursos + Inscripción

> **2026-07-14: en pausa, sin fecha.** Decisión de producto — Cursos se queda como está (pantalla "Próximamente"
> dentro de Ecosistema + formulario de interés que manda un lead a `service_leads`). El diseño de abajo queda
> de referencia para cuando se decida retomarlo, no es un compromiso de corto plazo.

**Objetivo:** listar cursos (online/presenciales) del ecosistema agro y permitir que el usuario se inscriba desde la app.

### Schema propuesto (`supabase/`)
```sql
create type course_modality as enum ('online', 'presencial', 'hibrido');
create type enrollment_status as enum ('pending', 'confirmed', 'cancelled');

create table courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  title text not null,
  description text not null,
  instructor text,
  modality course_modality not null default 'online',
  price numeric(14,2) not null default 0,
  currency currency_code not null default 'PYG',
  capacity integer, -- null = sin límite
  location text, -- solo si presencial/hibrido
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  registration_url text, -- si la inscripción real ocurre afuera (ej. Google Forms)
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status enrollment_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);
```
RLS: lectura pública de cursos publicados; cada usuario gestiona sus propias inscripciones; organización dueña puede ver inscriptos de sus cursos (vía `organization_members`).

### Pantallas app móvil
- `app/(main)/courses.tsx` — lista con filtro por modalidad/categoría
- `app/(main)/course/[id].tsx` — detalle + botón "Inscribirme" (crea fila en `course_enrollments`)
- `app/(main)/profile.tsx` — sección "Mis cursos" (inscripciones activas)

### Admin web
- `/admin/cursos` — CRUD + ver lista de inscriptos por curso (exportar a CSV es un buen extra)

**Esfuerzo estimado:** 1-2 sesiones (schema + 2 pantallas app + CRUD admin).

---

## 4. Feature 3 — Biblioteca Digital (tipo Netflix)

**Objetivo:** catálogo de libros/documentos digitales del agro, navegable tipo Netflix (carruseles por categoría), donde el usuario "colecciona" (guarda) títulos para leer después.

### Schema propuesto
```sql
create table library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  description text not null,
  category text not null, -- reusar NewsCategory o categorías propias (manuales, revistas, técnico, etc.)
  cover_image_url text not null,
  file_url text not null, -- PDF/EPUB en bucket 'library-files'
  file_type text not null default 'pdf', -- pdf | epub
  page_count integer,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table user_library (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references library_items(id) on delete cascade,
  added_at timestamptz not null default now(),
  last_opened_at timestamptz,
  progress_percent numeric(5,2) default 0, -- opcional: retomar lectura
  primary key (user_id, item_id)
);
```
Storage bucket nuevo: `library-covers` (público) + `library-files` (privado, servir con URL firmada para no regalar el PDF completo si hay contenido pago).

### Pantallas app móvil
- `app/(main)/library.tsx` — grid tipo Netflix, carruseles horizontales por categoría, buscador
- `app/(main)/book/[id].tsx` — detalle + botón "Agregar a mi biblioteca" + lector (visor PDF: `react-native-pdf` o `WebView` apuntando a un visor)
- Sección "Mi biblioteca" (favoritos/guardados) — podría vivir en Perfil o como tab propio

**Decisión pendiente para próxima sesión:** ¿el lector es in-app (mejor UX, más esfuerzo) o abre el PDF en el visor nativo/WebView (más rápido de construir)? Recomiendo arrancar con WebView y migrar a lector nativo si hace falta paginación/offline.

**Esfuerzo estimado:** 2-3 sesiones (es la feature más grande de las tres — maneja archivos, storage, y un componente de UI tipo Netflix nuevo).

---

## 5. Orden sugerido de trabajo

1. **Banner → Evento** (rápido, reutiliza todo lo existente) — habilita ya el caso de uso que pediste primero.
2. **Cursos** (schema + CRUD admin + 2 pantallas) — feature acotada y de alto valor (monetizable).
3. **Biblioteca digital** — la más grande, dejarla para cuando haya más tiempo porque toca storage y un componente de UI nuevo (carruseles tipo Netflix).

No recomiendo meter las tres en una sola sesión — cada una toca schema + pantallas + (en cursos y banner) admin web, y apurarlas es la forma más común de terminar con RLS mal configurado o pantallas a medio hacer.

---

## 6. Camino a la primera APK

**Actualizado 2026-07-03:** se decidió usar **EAS Build** después de todo (en vez del build local con Android Studio que se había planteado antes). Ya está configurado: `mobile/eas.json` existe con perfiles `development`/`preview`/`production`, y el proyecto está linkeado a una cuenta de Expo (`eas build:configure` ya se corrió).

### Comandos (desde `mobile/`, correrlos en tu propia terminal — `eas login` es interactivo)
```bash
# Development build (incluye expo-dev-client, para seguir developando con hot reload)
eas build --profile development --platform android
eas build --profile development --platform ios   # necesita cuenta Apple Developer paga

# Build de producción (el que se comparte/sube a las stores)
eas build --profile production --platform android
```

### Pendiente
- [ ] Correr el primer `eas build --profile development --platform android` y confirmar que instala y abre bien.
- [ ] Cuando se quiera publicar de verdad: `eas build --profile production` + `eas submit` (Play Store / App Store).

---

## 7. Pendientes generales (fuera de las 3 features nuevas)

- [ ] Formularios de publicación desde la app móvil (hoy solo desde web admin)
- [ ] Tests (no hay suite todavía)
- [ ] Configurar `eas.json` si en algún momento se decide usar EAS Build/Submit para Play Store

---

## 8. Feature 4 (propuesta, sin fecha) — Descubrir como módulos reales, no solo "Próximamente"

> **2026-07-14:** anotado a pedido explícito, para retomar en una actualización futura — no arrancar sin
> confirmar primero, es una propuesta de arquitectura, no un compromiso de sprint.

**Problema a resolver:** hoy Clasificados, Bolsa de Trabajo, Remates Online y Cursos son 4 tiles en Descubrir
que abren la misma pantalla genérica (`mobile/app/(main)/ecosistema/[slug].tsx`) con descripción + formulario
de interés (`service_leads`). La propuesta es cómo construir las versiones reales de cada uno sin terminar
con 4 subsistemas separados, cada uno con su propio schema, su propia cola de moderación y su propio admin.

**La idea central — reusar la columna vertebral que ya existe, no duplicarla.** `posts` ya es un tipo unificado
(`content_type`: `article | video | auction | institutional_notice`) con todo lo caro ya resuelto: cola de
moderación (`editorial_status`: draft → pending_review → published → rejected/archived), RLS, ownership por
`organization_id`, push automático al aprobar, banners segmentados por categoría, admin CRUD en
`/admin/publicaciones`. Extender ese mismo tipo en vez de inventar 4 tablas + 4 pantallas admin nuevas desde
cero es lo que lo hace escalable de verdad:

1. **Remates Online — prácticamente gratis.** `content_type: 'auction'` con `auction_status`
   (`upcoming/live/finished`) **ya existe y ya funciona** (`mobile/app/(main)/video/[id].tsx`,
   `videos.tsx`). Solo falta exponer ese mismo feed filtrado dentro de la pestaña Descubrir en vez de que
   viva únicamente en Videos. Esto se podría hacer primero — es casi 100% trabajo de UI, cero schema nuevo.

2. **Clasificados y Bolsa de Trabajo — mismo patrón, un `content_type` nuevo cada uno.** Agregar
   `classified_listing` y `job_listing` al enum `content_type`, y una columna `metadata jsonb` en `posts`
   para los campos propios de cada tipo (precio/moneda/ubicación para clasificados; rango salarial/modalidad
   para empleos) sin tocar el resto de columnas. Se hereda gratis: moderación, RLS, ownership, admin CRUD
   (solo hay que agregar los campos de `metadata` al formulario del admin), y el feed ya sabe filtrar por
   `content_type`. El costo real por módulo es: 1-2 pantallas mobile (lista + detalle) + los campos nuevos en
   el form de `/admin/publicaciones` — no un subsistema nuevo.

3. **Cursos — el único que sí necesita tablas propias.** Inscripción/capacidad/asistencia es una forma de
   dato genuinamente distinta (no es "contenido editorial", es una relación usuario↔sesión con estado). Acá
   sí aplica el diseño ya escrito en la sección 3 de este documento — no forzarlo dentro de `posts`.

**Rollout sin bloquear nada:** `UPCOMING_PLATFORMS` (`mobile/lib/ecosystem-data.ts`) pasa a tener un campo
`status: 'coming_soon' | 'live'`. Mientras un módulo esté en `coming_soon` sigue mostrando la pantalla actual
de interés (`ecosistema/[slug].tsx`, ya construida) — el día que se activa, ese slug pasa a renderizar la
pantalla real del módulo. Cada plataforma se prende de forma independiente, sin tocar las otras tres.

**Orden sugerido:** Remates Online (casi gratis) → Clasificados → Bolsa de Trabajo → Cursos (el más caro,
al final).

Descartado (2026-07-14): AgroClima, AgroMercado, AgroTV — no se van a construir. Las próximas plataformas del
ecosistema mobile se agregan hardcodeadas vía actualización nativa de la app (`mobile/lib/ecosystem-data.ts`),
no desde un admin dinámico.

---

## 9. Feature 5 (propuesta, sin fecha) — Evento Especial estilo OneFootball

> **2026-07-14:** anotado a pedido explícito para la **próxima versión** de la app — no arrancar sin
> confirmar primero. Es la evolución del hub de eventos que ya existe (`event/[slug].tsx`, Info/Programa/
> Noticias), pensada como feature premium para vender a organizaciones (ver sección de monetización
> discutida en chat — encaja directo con el modelo "Aliado Cosecha" ya diseñado).

**Alcance confirmado con el usuario (dos preguntas resueltas):**
- Qué se calca de OneFootball: **timeline en vivo + alertas push** — no el marcador automático (acá no hay
  un feed de datos que se actualice solo, como el resultado de un partido).
- Quién publica las actualizaciones: **el organizador, a mano**, como un liveblog — no es automático.

**Restricción de arquitectura a respetar (ya documentada en la sección 1):** los `events` viven en el
Supabase **externo** de eventosagropy.com — no hay FK real entre ese proyecto y el principal. Igual que
`event_schedule_items` y `posts.event_tag`, la tabla nueva va en el Supabase **principal**, referenciando el
evento por `event_slug` (texto), no por FK.

### Schema propuesto (`supabase/`, mismo archivo/patrón que `event_schedule_items`)
```sql
create table if not exists public.event_live_updates (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  headline text not null,
  body text,
  is_pinned boolean not null default false,   -- para fijar un update arriba de todos (ej. "Remate confirmado")
  notify boolean not null default false,       -- si true, dispara push al crearse
  posted_at timestamptz not null default now(),
  posted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index event_live_updates_slug_idx on event_live_updates (event_slug, posted_at desc);
```
RLS: lectura pública; escritura solo para admins/org_editor de la organización dueña del evento (mismo
criterio de permisos que ya usa `/admin/eventos`).

### Admin (web) — `/admin/eventos`
Nueva sub-sección "En vivo" junto a Programa y Tagging de noticias, mismo patrón de formulario + lista
cronológica ya construido para Programa: título corto + texto opcional + checkbox "fijar arriba" + checkbox
"enviar notificación". Al crear un update con `notify: true`, el server action llama a `sendPushToAll(...)`
reusando el filtro por categoría que ya armamos para notificaciones (Fase de notificaciones reales,
2026-07-14) — no hay que construir esa parte de nuevo.

### Mobile — hub del evento (`event/[slug].tsx`)
- Nueva pestaña **"En Vivo"**, junto a Info/Programa/Noticias, con el mismo criterio ya usado: solo aparece
  si el evento tiene updates cargados.
- Timeline vertical, más reciente arriba; el update fijado (`is_pinned`) se destaca aparte con otro estilo.
- Pull-to-refresh para traer actualizaciones nuevas sin salir de la pantalla (mismo patrón de la Fase F).
- Badge "EN VIVO" en el header del hub mientras el evento está en su ventana de fecha activa — reusar el
  mismo patrón visual que ya existe para remates en vivo en `video/[id].tsx`.
- El push de cada update deep-linkea directo a la pestaña "En Vivo" del evento (mismo mecanismo que ya usa
  `articleId` para abrir una noticia al tocar la notificación).

### Orden sugerido
1. Tabla + RLS + CRUD admin de updates, sin push todavía — pestaña "En Vivo" en mobile solo lectura.
2. Push al crear un update marcado `notify` (reusa infraestructura ya construida).
3. Badge "EN VIVO" en el header del hub + deep-link directo a la pestaña.
4. *(v2, opcional, no de entrada)* auto-refresh/polling mientras la pestaña está abierta, para que se sienta
   más "en vivo" sin que el usuario tenga que tirar del pull-to-refresh a cada rato.

---

## 10. Feature 6 (propuesta, sin fecha) — Scraping de noticias institucionales (MAG, SENAVE, INFONA)

> **2026-07-14:** anotado a pedido explícito, para la **próxima versión**. Decisiones ya confirmadas con el
> usuario vía preguntas directas: (1) modelo **resumen + link afuera** (no contenido completo — evita el
> riesgo legal de republicar notas ajenas), (2) los 3 dominios a monitorear ya están confirmados:
> `mag.gov.py`, `senave.gov.py`, `infona.gov.py`.

**Por qué "resumen + link" y no "contenido completo":** extraer título/imagen/resumen y linkear afuera es
el modelo estándar de cualquier agregador (Google News, Flipboard) y no tiene riesgo de copyright. Traer y
republicar el cuerpo completo de la nota de otro sitio sí lo tiene — la mayoría de los medios prohíben esto
en sus términos de uso. Se descarta esa opción.

### Auditoría real de los 3 dominios (hecha en esta sesión, navegando cada sitio)

Cada dominio necesita un adaptador distinto porque no todos exponen la misma estructura:

| Dominio | CMS | Método de extracción | Dificultad |
|---|---|---|---|
| `senave.gov.py` | WordPress | **API REST nativa** — `GET /wp-json/wp/v2/posts?per_page=10&_embed` devuelve JSON con `title.rendered`, `excerpt.rendered`, `link`, `date`, e imagen destacada en `_embedded['wp:featuredmedia'][0].source_url`. Confirmado funcionando, sin autenticación. | Trivial — no hace falta scraping de HTML, es un fetch + parseo de JSON. |
| `infona.gov.py` | WordPress | Mismo caso que SENAVE — API REST abierta, mismos campos. Confirmado funcionando. | Trivial, igual que SENAVE. |
| `mag.gov.py` | Concrete5 (CMS a medida, no WordPress) | **No tiene API ni Open Graph.** Sí tiene: `<meta name="description">` con resumen limpio, URL canónica (`link[rel=canonical]`), listado de notas en `/index.php/noticias` con links a `/index.php/noticias/<slug>`, y la primera imagen dentro del cuerpo del artículo sirve como imagen de portada. Confirmado navegando un artículo real. | Necesita un parser HTML propio (fetch + `cheerio` para leer `<title>`, meta description, primera imagen del contenido) — no es scraping fràgil de "contenido libre", son 3-4 selectores fijos y estables porque el CMS no cambia de estructura seguido. |

**Conclusión de la auditoría: los 3 son viables.** SENAVE e INFONA son el caso fácil (API JSON nativa). MAG
necesita un adaptador HTML dedicado, pero acotado y estable (no un scraper genérico que se rompe con
cualquier sitio nuevo).

### Arquitectura propuesta

**Patrón de adaptadores, no un scraper genérico:**
```ts
type ScrapeAdapter = 'wordpress-api' | 'mag-html'

interface ScrapeSource {
  domain: string
  adapter: ScrapeAdapter
  baseUrl: string
  defaultCategory: NewsCategory
}

const SOURCES: ScrapeSource[] = [
  { domain: 'senave.gov.py', adapter: 'wordpress-api', baseUrl: 'https://www.senave.gov.py', defaultCategory: 'agricultura' },
  { domain: 'infona.gov.py', adapter: 'wordpress-api', baseUrl: 'https://infona.gov.py', defaultCategory: 'institucional' },
  { domain: 'mag.gov.py', adapter: 'mag-html', baseUrl: 'https://www.mag.gov.py', defaultCategory: 'institucional' },
]
```
Agregar un cuarto dominio en el futuro es sumar una entrada a este array (y un adaptador nuevo solo si el
CMS no es WordPress) — no tocar el resto del sistema.

**Dónde vive lo scrapeado:** en `posts`, con un flag nuevo `source_type: 'manual' | 'scraped'` (o un
`content_type` nuevo `external_news`, a decidir) + una columna `external_url` (con restricción `unique` para
deduplicar — si ya existe esa URL, no se reinserta) + `organization_id` **nulo**, usando en cambio el
`domain` como texto plano en `source` (estas notas no tienen una organización verificada real detrás, a
diferencia de los medios/gremios que ya publican como `Organization`).

**El cron de dos cortes (6am / 6pt):** no hace falta un endpoint público ni autenticación nueva. La forma
más simple, sin agregar infraestructura: un **GitHub Actions con `schedule: cron`** (usan `cron: '0 9,21 * *
*'` en UTC para las 6am/6pm de Paraguay) que corre un script Node (`scripts/scrape-news.mjs`) directo en el
runner de GitHub, usando el `SUPABASE_SERVICE_ROLE_KEY` que ya está cargado como secret (el mismo que usa el
deploy) para insertar directo en `posts`. Sin exponer ningún endpoint nuevo a internet.

**Moderación:** las notas scrapeadas entran con `editorial_status: 'pending_review'` igual que cualquier
otra nota — no se publican solas sin pasar por `/admin/publicaciones`, salvo que el usuario prefiera
saltear ese paso para estas fuentes institucionales específicas (a decidir cuando se retome).

### Orden sugerido
1. Adaptador `wordpress-api` (SENAVE + INFONA) — el más rápido de tener funcionando, cero scraping de HTML.
2. Adaptador `mag-html` — un poco más de trabajo, pero acotado a un solo sitio con estructura estable.
3. Script + GitHub Action con el cron de dos cortes diarios.
4. Definir si las notas scrapeadas requieren aprobación manual o se auto-publican para estas 3 fuentes
   institucionales de confianza.
