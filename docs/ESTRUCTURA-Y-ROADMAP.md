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
- [ ] AgroClima, AgroMercado, AgroTV (próximas plataformas del ecosistema)
- [ ] Tests (no hay suite todavía)
- [ ] Configurar `eas.json` si en algún momento se decide usar EAS Build/Submit para Play Store
