# AGROCONECTA — Claude Code Session Guide

## Qué es este proyecto

**Agroconecta** es un ecosistema digital agropecuario para Paraguay. Centraliza noticias, precios de mercado, videos y productos del ecosistema para productores, veterinarios, agrónomos, comunicadores y demás profesionales del agro paraguayo.

Es un **monorepo** con tres piezas que comparten el mismo backend (Supabase). `mobile/` y `web/` son proyectos
totalmente independientes — cada uno con su propio `package.json`, `node_modules` y tooling:

| Pieza | Carpeta | Stack | Estado |
|---|---|---|---|
| **App móvil** | `mobile/` | React Native + Expo SDK 55 | Funcional, compila sin errores |
| **Web pública + admin** | `web/` | Next.js 16 (App Router) | Funcional, deploy en Vercel |
| **Backend** | `supabase/` | Supabase (Postgres + Auth + Storage) | Operativo |

> El panel `admin-web/` antiguo quedó como referencia y **no se deploya**. La fuente de verdad para producción web es `web/`.
>
> **2026-08-13:** rediseño completo de la app móvil siguiendo el handoff de diseño
> `docs/design_handoff_home_redesign/` (bocetos 3a y 4a-4f) — solo `mobile/`, no se tocó `web/`. Tipografía
> pasó de Lexend a **Noto Sans** en toda la app (`constants/typography.ts` sigue mapeando las claves viejas
> `poppins`/`dmSans`, mismo truco que antes con Lexend; `Text` ahora también acepta `family="noto-sans"` +
> `size`/`lineHeight` sueltos). Nuevo namespace `Colors.redesign` con la paleta clara fija del boceto (no
> depende del toggle de tema). Tab bar bajó a 2 ítems visibles (Inicio, Ecosistema); Precios y Noticias siguen
> navegables pero fuera de la barra (`href: null`) — Noticias se movió de `app/(main)/noticias.tsx` a
> `app/(main)/(tabs)/noticias.tsx` para heredar la tab bar del boceto. Inicio, Ecosistema, Precios y Noticias
> ya tienen cabecera oscura propia embebida; el resto de las pantallas sigue con la `AppHeaderBar` compartida
> vieja hasta que se rediseñen. Se sacó la publicidad de Mercado/Nota individual (el boceto no la tiene ahí);
> Noticias reusa el placement `"home"` porque no existe un placement dedicado (agregar uno toca también el
> admin de `web/`, fuera de este alcance). Se revirtió la decisión de "Ecosistema sin marketplace": ahora
> Empleos/Clasificados/Cursos muestran publicaciones reales (`EcosystemListing` — ver
> `supabase/fix-ecosystem-listings.sql`, todavía sin panel admin, se carga por SQL) en vez de la pantalla
> "Próximamente" + formulario de interés; Remates Online no cambió — ya tenía contenido real vía posts
> `contentType: 'auction'` y ahora apunta directo a Videos. La sección "Últimas publicaciones" del boceto 4d
> (feed mezclado de las tres categorías) no se construyó — se decidió mostrar Videos + la lista de
> plataformas en su lugar, ver la ficha única (`listing/[id].tsx`) para el detalle de cada publicación.
>
> **2026-07-22:** trabajo de compliance para subir a las stores. Login: se reactivó email+contraseña
> (`signIn`/`signUp` ya existían sin usar en `app-context.tsx`, solo faltaba la vista en `login.tsx`) —
> necesario porque Apple Review pide una credencial fija reutilizable y Google OAuth/OTP no sirven para eso.
> **Importante:** crear la cuenta demo para Apple desde Supabase Dashboard → Authentication → Users → Add
> User (auto-confirma el email), no desde el signup de la app, para no depender de la confirmación por mail.
> Eliminación de cuenta: nuevo endpoint `web/app/api/delete-account/route.ts` (usa `SUPABASE_SERVICE_ROLE_KEY`
> para `auth.admin.deleteUser`, valida el JWT del usuario antes de borrar) + botón "Eliminar cuenta" en
> Perfil (mobile) que lo llama. Todas las tablas de usuario (`profiles`, `user_interests`,
> `user_subscriptions`, `push_tokens`, `user_library`) ya tenían `on delete cascade` sobre `auth.users`, así
> que borrar el usuario limpia todo solo — no hizo falta tocar el schema. Web: nuevas páginas públicas
> `/politica` (privacy policy — requerida por Play Console) y `/soporte` (formulario de contacto, reusa
> `/api/service-lead`; también sirve como vía de solicitar borrado de cuenta sin la app), linkeadas desde el
> Footer. `web/lib/social-links.ts` centraliza redes sociales/WhatsApp (antes duplicado en `Footer.tsx`).
>
> **2026-07-14 (tarde):** login mobile simplificado a solo Google + código por email (se sacó Apple y contraseña);
> se corrigió un bug donde una cuenta nueva heredaba el perfil cacheado de la sesión anterior en el mismo
> dispositivo en vez de disparar onboarding (`resolveProfileForCurrentSession` en `app-context.tsx`); reproductor
> de YouTube pasó de `WebView` manual a `react-native-youtube-iframe` (arreglaba el error 153); pull-to-refresh
> en Home/Videos/Precios/Eventos/Aliados/Biblioteca/Noticias; el popup "Próximamente" de Ecosistema ahora es
> una pantalla propia por plataforma (`ecosistema/[slug].tsx`) con formulario de interés, no un simple modal;
> notificaciones dejaron de ser cosméticas — `profiles.notification_prefs` se sincroniza desde el perfil y
> `sendPushToAll` filtra destinatarios por categoría (el push automático al aprobar una nota importante usa
> `breakingNews`, el envío manual desde `/admin/notificaciones` deja elegir categoría o mandar a todos);
> redes sociales + WhatsApp agregados en Contacto (mobile) y Footer (web). Se descartó el plan de admin-CMS
> para el Ecosistema (`ecosystem_sites`, `/admin/ecosistema`) — las próximas plataformas se agregan de forma
> nativa vía actualizaciones de la app, no dinámicamente desde el panel.
>
> **2026-07-14:** `AGENTS.md` queda como guia corta para sesiones con poco contexto; `CLAUDE.md` mantiene la guia amplia. La capa mobile de Supabase ya no usa `any` explicitos en sus mapeadores principales y `app-context` sincroniza perfil/intereses/suscripciones a Supabase best-effort cuando hay usuario autenticado.
>
> **2026-07-03:** se reorganizó el repo — todo lo de la app móvil (antes suelto en la raíz: `app/`, `components/`,
> `lib/`, `constants/`, `assets/`, configs) se movió a `mobile/`. De paso se borró un scaffold viejo de Next.js/v0
> (`components/ui/*` estilo shadcn, `components/screens/`, `hooks/`, `next.config.*`, `public/`, `styles/`, etc.)
> que quedó pisado en la raíz desde antes de que `web/` existiera como proyecto separado — eran duplicados
> exactos de archivos ya presentes en `web/`, no se usaban en ningún lado.

---

## Stack tecnológico (real, no target)

### App móvil (`mobile/`)

| Capa | Tecnología |
|---|---|
| Framework | React Native `0.83` + Expo SDK `~55` |
| Router | Expo Router `~55` (file-based) |
| Styling | NativeWind v4 + `global.css` + `tailwind.config.js` |
| State | React Context API (`lib/app-context.tsx`, `lib/theme-context.tsx`) |
| Backend client | `@supabase/supabase-js` v2 |
| Auth | Supabase Auth — Google OAuth, código por email (OTP) y email+contraseña (2026-07-22, reactivado para dar credencial de demo a Apple Review) |
| Persistencia | AsyncStorage (`@agroconecta:user`) |
| Tipos | TypeScript estricto (`npm run tsc` pasa limpio) |
| Íconos | `@expo/vector-icons` (Ionicons) |
| Fuentes | Noto Sans (`@expo-google-fonts/noto-sans`) — única familia para toda la app (2026-08, reemplazó a Lexend en el rediseño) |
| Validación | Zod + React Hook Form |
| Extras | expo-haptics, expo-image, expo-linear-gradient, expo-notifications, react-native-webview, react-native-reanimated 4 |

### Web (`web/`)

| Capa | Tecnología |
|---|---|
| Framework | Next.js `^16` (App Router, SSR dinámico) |
| Styling | Tailwind CSS 3 |
| Backend | `@supabase/ssr` + `@supabase/supabase-js` |
| Auth admin | Supabase Auth (cookies SSR) |
| Deploy | Vercel (Root Directory = `web`, auto-deploy en push a `main`). Método viejo (Hostinger + GitHub Actions) desactivado desde 2026-07-05, ver `DEPLOY.md` sección 8 |

---

## Backend — Supabase

- **URL:** `https://ukodavvtmrrqnfgyvqql.supabase.co`
- **Credenciales:** en `.env.local` (móvil) y `.env.production` en el servidor (web). Gitignoreado.
- **Tablas:** `profiles` (incluye `notification_prefs` jsonb), `organizations` (incluye columnas de Aliado: `ally_plan`, `ally_category`, `ally_founder`), `organization_members`, `posts`, `user_interests`, `user_subscriptions`, `market_prices`, `push_tokens`, `ad_campaigns`, `service_leads`, `library_items`, `user_library`, `event_schedule_items`
- **Storage buckets:** `organization-logos`, `banners`, `post-images`
- **Esquema y seed:** `supabase/schema.sql`, `supabase/seed.sql` + scripts `fix-*.sql` para migraciones puntuales
- **Acceso desde la app:** `mobile/lib/supabase.ts` (cliente) y `mobile/lib/supabase-repositories.ts` (queries tipadas: posts, organizations, market_prices, events, banners, biblioteca). Los repos usan interfaces de fila locales para datos Supabase, normalizan `null` a `undefined`/fallbacks y mapean snake_case de la DB → camelCase de los tipos TS.

---

## Estructura de carpetas

```
AGROCONECTA APP/
├── mobile/                       # App móvil — proyecto Expo autocontenido
│   ├── app/                      # Expo Router (rutas file-based)
│   │   ├── _layout.tsx           # Root: fonts, AppProvider, ThemeProvider, splash
│   │   ├── index.tsx             # Entry → splash → onboarding o main
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   └── login.tsx         # Login Supabase
│   │   ├── (onboarding)/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx         # Flujo onboarding (nombre, email, profesión, depto, prefs, subs)
│   │   ├── (main)/                   # Bottom tabs
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx              # Feed de noticias
│   │   │   ├── prices.tsx            # Precios ganaderos + commodities
│   │   │   ├── videos.tsx            # Videos / remates
│   │   │   ├── ecosystem.tsx         # Ecosistema digital
│   │   │   ├── events.tsx            # Listado de eventos
│   │   │   ├── event/[slug].tsx      # Hub de evento — info + Programa/Noticias dinámicos
│   │   │   ├── profile.tsx           # Perfil
│   │   │   ├── webview.tsx           # WebView in-app
│   │   │   ├── article/              # Detalle de artículo (dentro de tabs)
│   │   │   └── publisher/            # Perfil de organización
│   │   ├── article/[id].tsx      # Detalle de artículo (ruta directa)
│   │   └── publisher/[id].tsx    # Perfil de organización (ruta directa)
│   │
│   ├── components/
│   │   ├── ui/                   # Design system base (Button, Card, Badge, Text, AdBanner, ReminderModal)
│   │   ├── home/                 # FeaturedCard, FeaturedGrid, NewsCard, SectionHeader, EventCard, EventsSection, …
│   │   ├── navigation/           # AppHeaderBar, DrawerMenu, FilterSheet
│   │   └── profile/               # Sheets: EditProfile, Appearance, Notifications, Preferences, Settings, Media
│   │
│   ├── lib/                      # Lógica compartida móvil
│   │   ├── types.ts              # TODOS los tipos del dominio
│   │   ├── app-context.tsx       # Estado global: auth + onboarding + user
│   │   ├── theme-context.tsx     # Tema claro/oscuro
│   │   ├── supabase.ts           # Cliente Supabase (principal)
│   │   ├── supabase-events.ts    # Cliente Supabase de eventosagropy.com (externo, solo lectura)
│   │   ├── supabase-repositories.ts  # Queries: posts, organizations, market_prices, events, banners
│   │   ├── ad-segments.ts        # Segmentación de anuncios
│   │   ├── push-notifications.ts # Registro de push token (activo)
│   │   ├── feed-types.ts / feed-utils.ts
│   │   └── mock-data.ts          # Datos de fallback / desarrollo
│   │
│   ├── constants/                # colors.ts, typography.ts, spacing.ts
│   ├── assets/                   # fonts + images
│   ├── app.json                  # Config Expo
│   ├── eas.json                  # Perfiles de build EAS (development/preview/production)
│   └── package.json / tsconfig.json / babel.config.js / metro.config.js / tailwind.config.js / global.css
│
├── web/                          # Web pública + admin (Next.js 16) — proyecto autocontenido
│   ├── app/
│   │   ├── page.tsx              # Home (feed)
│   │   ├── noticias/[id]         # Detalle SSR + Open Graph
│   │   ├── precios/              # Precios públicos
│   │   ├── ecosistema/           # Ecosistema
│   │   ├── quienes-somos/
│   │   ├── api/ · auth/ · robots.ts · sitemap.ts
│   │   └── admin/
│   │       ├── (auth)/login      # Login admin
│   │       └── (dashboard)/      # publicaciones, organizaciones, precios, banners, eventos
│   ├── components/               # Header, Footer, NewsCard, AdBanner, ThemeToggle, …
│   └── lib/                      # supabase-{browser,server,admin}.ts, auth-roles.ts, seo.ts
│
├── supabase/                     # schema.sql, seed.sql, fix-*.sql (compartido por mobile/ y web/)
├── docs/                         # mvp-implementation.md, ESTRUCTURA-Y-ROADMAP.md, …
├── DEPLOY.md                     # Guía de deploy (Vercel; método viejo a Hostinger documentado como legacy)
├── AGENTS.md                     # Notas para agentes
└── .github/workflows/deploy-web.yml  # Deploy a Hostinger — desactivado desde 2026-07-05, solo workflow_dispatch manual
```

---

## Design System

### Paleta de colores

Siempre usar las constantes de `constants/colors.ts`, nunca valores hardcodeados.

```typescript
const colors = {
  // Marca
  lime: '#A4D233',          // verde lima principal
  limeDark: '#8BB82B',

  // Fondos (dark — default)
  background: '#0A0A13',
  surface: '#12121C',
  secondary: '#1A1A26',

  // Texto
  foreground: '#FFFFFF',
  mutedForeground: '#8B8B9A',

  // Sistema
  border: '#2A2A3A',
  destructive: '#FF4D4D',

  // Light
  lightBackground: '#FAFAFA',
  lightSurface: '#FFFFFF',
  lightSecondary: '#F0F0F0',
  lightForeground: '#0A0A13',
  lightBorder: '#E5E5E5',
  lightLime: '#7AB800',
}
```

### Tipografía

- **Mobile: una sola familia, Noto Sans** (400–800, 2026-08). `constants/typography.ts` mantiene las claves
  viejas (`poppins`/`dmSans`) apuntando a Noto Sans en vez de Lexend, para no tener que tocar los ~30
  componentes que usan `family="poppins"`/`family="dm-sans"`. `Text` también acepta `family="noto-sans"` +
  `size`/`lineHeight` puntuales para los tamaños específicos del rediseño (boceto `design_handoff_home_redesign`).
- **Web: sigue en Lexend** (400–700) — no se tocó en el rediseño mobile. `app/layout.tsx` mantiene las
  claves/variables viejas (`--font-poppins`/`--font-dm-sans`) apuntando a Lexend.

### Border radius

`sm` 8 · `md` 10 · `base`/`lg` 12 · `xl` 16

### Spacing

Múltiplos de 4. Base unit = 4px.

---

## App móvil — pantallas y flujo

### 1. Splash
Logo + animación, decide ruta inicial (onboarding si no hay usuario, main si ya hay).

### 2. Auth + Onboarding
- Login Supabase (`mobile/app/(auth)/login.tsx`) — tres opciones: **Google (OAuth)**, **código por email (OTP de 8 dígitos)** y **email + contraseña** (reactivado 2026-07-22 para poder darle una credencial fija a Apple Review — OAuth/OTP no sirven como "usuario/clave" reutilizable para un reviewer). No hay login con Apple.
- Onboarding recoge: **nombre, email, teléfono, profesión, departamento, preferencias de noticias, suscripciones a organizaciones/medios**.
- Al completar: crea `UserProfile`, lo persiste en AsyncStorage y marca `isComplete`.
- `resolveProfileForCurrentSession()` (en `app-context.tsx`) se llama justo después de un login exitoso: valida que el perfil cacheado en AsyncStorage pertenezca al `auth.uid()` de la sesión actual antes de saltar onboarding — evita que una cuenta nueva en el mismo dispositivo herede el perfil de la cuenta anterior.

### 3. Main — Bottom Tabs (2026-08, rediseño: 2 tabs visibles, cabecera propia por pantalla)

| Tab | Descripción |
|---|---|
| Inicio | Tablero: cabecera propia (saludo, "Ajustar interés", buscador) + Tu mercado hoy + En vivo + Noticias para vos + Agenda del sector + Ecosistema |
| Ecosistema | Videos (real, `contentType` video/auction) + lista de plataformas (Clasificados, Bolsa de Trabajo, Remates Online, Cursos) |

Precios, Noticias y Perfil ya no están en la tab bar (`href: null` en `Tabs.Screen`) pero siguen siendo rutas
navegables dentro del mismo grupo `(tabs)` — se entra desde "Ver todos"/"Mostrar más" en Inicio o el avatar de
la cabecera — y por eso conservan la barra inferior. Cada una de estas 4 pantallas (Inicio/Ecosistema/Precios/
Noticias) ya tiene su propia cabecera oscura embebida (`(tabs)/_layout.tsx` la oculta ahí y deja la
`AppHeaderBar` compartida solo para las que faltan rediseñar). Videos/Remates (`videos.tsx`, reproductor
`react-native-youtube-iframe`) sigue fuera de la tab bar — se accede desde "Remates Online" en Ecosistema, el
botón "EN VIVO" del header viejo (pantallas sin rediseñar) y el drawer.

---

## Tipos de datos clave

> La fuente de verdad es `mobile/lib/types.ts`. Resumen de lo importante (puede expandirse — leer el archivo antes de tocar tipos):

- **`Profession`** y **`Department`** son **slugs en kebab-case** (`'agronomo'`, `'alto-parana'`), no nombres de display. La capa de UI mapea slug → etiqueta legible.
- **`Post`** unifica artículos, videos, remates y avisos institucionales vía `contentType` + `editorialStatus` (`draft | pending_review | published | rejected | archived`). `NewsArticle = Post`.
- **`Organization`** (= `Publisher`) tiene `commercialStatus` (`trial | active | overdue | paused`) y `planName` — modelo B2B.
- **`MarketPrice`** unifica precios; también existen `CattlePrice` e `InternationalPrice`.
- **`AdCampaign` / `MockAd` / `AdSegment`** modelan anuncios segmentados por profesión, departamento y categorías.
- **`UserProfile`** incluye `organizationSubscriptions`, `mediaPreferences`, `notificationPrefs`.

---

## Reglas de desarrollo

1. **Light theme como default** (cambiado 2026-07-03); el tema oscuro sigue disponible vía `theme-context` y el usuario puede activarlo desde su perfil.
2. **TypeScript estricto** — sin `any` en código nuevo. Para datos externos, crear tipos de frontera y mapearlos a tipos de dominio antes de llegar a UI.
3. **Español** — toda la UI en español, contexto paraguayo.
4. **Mobile-first** — referencia 390px (iPhone 14 Pro).
5. **Sin comentarios obvios** — comentar el *por qué*, no el *qué*.
6. **Componentes chicos** — dividir si superan ~150 líneas.
7. **Constants extraídas** — nunca hardcodear colores ni strings.
8. **Moneda:** ganadero en PYG (₲), commodities en USD ($).
9. **Datos:** preferir los repositorios de Supabase; `mock-data.ts` es solo fallback/desarrollo.
10. **Perfil de usuario:** AsyncStorage funciona como cache local; al completar onboarding o editar perfil, `app-context` sincroniza best-effort `profiles`, `user_interests` y `user_subscriptions` en Supabase si el usuario tiene UUID valido.

---

## Comandos útiles

```bash
# --- App móvil (cd mobile) ---
npm start              # expo start
npm run android        # expo run:android
npm run ios            # expo run:ios
npm run web            # expo start --web
npm run tsc            # tsc --noEmit (typecheck)
npx expo start --clear # limpiar caché

# --- EAS (cd mobile) ---
eas build --profile development --platform android   # development build
eas build --profile production --platform android    # build de producción

# --- Web (cd web) ---
npm run dev            # next dev -p 3000  → /admin para el panel
npm run build          # next build
npm run start          # next start -p 3000
```

---

## Estado del proyecto (2026-07-14)

### App móvil — ✅ funcional
- [x] Scaffold Expo Router + design system (tokens + componentes base)
- [x] Splash, login Supabase, onboarding multi-paso con persistencia AsyncStorage
- [x] Tabs: Inicio, Ecosistema en la barra (2026-08); Precios/Noticias/Perfil navegables sin estar en la barra — Videos vive fuera de la tab bar (botón "EN VIVO" del header + drawer)
- [x] Detalle de artículo, perfil de organización, WebView in-app
- [x] Eventos: listado, detalle, hub dinámico (Info + Programa + Noticias), recordatorios push
- [x] Repositorios Supabase (posts, organizations, market_prices, events, banners)
- [x] Segmentación de anuncios por profesión/departamento/categoría; banners con destino clickeable (evento/post/URL)
- [x] Notificaciones push activas de punta a punta (registro de token + tap-to-open)
- [x] Tema claro/oscuro
- [x] `npm run tsc` pasa sin errores
- [x] Repositorios Supabase tipados en la frontera de filas y sin `any` explicitos en los mapeadores principales
- [x] Perfil local sincroniza best-effort a Supabase al completar onboarding/editar perfil
- [x] EAS configurado (`mobile/eas.json`) — falta generar el primer build
- [x] Tema claro por defecto, grid de noticias 2 columnas + skeleton, legales, páginas de servicio, campanita persistida, eventos por organizador (2026-07-03)
- [x] Login solo Google + código OTP, bug de onboarding con cuenta nueva resuelto, YouTube nativo, pull-to-refresh en pantallas principales, popup de Ecosistema reemplazado por pantalla + CTA de interés, notificaciones con efecto real, redes sociales + WhatsApp en Contacto, tildes de departamentos/profesiones corregidas, edición de profesión, recordatorio de remates (2026-07-14)
- [x] Biblioteca digital (listado, detalle, "Mis colecciones", URL externa de archivo)

### Web — ✅ funcional
- [x] Páginas públicas: home, noticias/[id] (SSR+OG), precios, ecosistema, quiénes-somos
- [x] Panel admin: login, publicaciones (aprobar/rechazar), organizaciones, precios, banners, eventos (programa + tagging de noticias), notificaciones (push manual con categoría opcional)
- [x] SEO: robots.ts, sitemap.ts
- [x] Deploy en Vercel (Root Directory = `web`, auto-deploy en push a `main`) — desde 2026-07-05, reemplaza al deploy viejo a Hostinger vía GitHub Actions
- [x] Endpoint `POST /api/service-lead` listo para enviar los leads de servicio por email vía Resend (falta cargar `RESEND_API_KEY`/`SERVICE_LEAD_EMAIL_TO`)

> Nota: la sección "Ecosistema" del admin (`ecosystem_sites`, logos + disponibilidad editable) se sacó del panel
> (ver `web/app/admin/(dashboard)/`, tarea "Eliminar sección Ecosistema del admin") y **no se va a retomar**: las
> próximas plataformas del ecosistema mobile (`mobile/lib/ecosystem-data.ts`) se agregan hardcodeadas vía
> actualización nativa de la app, no dinámicamente desde un admin. El SQL `fix-ecosystem-sites.sql` que crea esa
> tabla quedó obsoleto — no hace falta correrlo.

### Camino a subir a las stores (bloquea la v2.0 — ver `docs/ESTRUCTURA-Y-ROADMAP.md`)
- [x] Login email+contraseña reactivado (credencial de demo para Apple Review)
- [x] Eliminación de cuenta (endpoint + botón en Perfil)
- [x] Páginas web `/politica` y `/soporte` (privacy policy pública + contacto/soporte)
- [ ] Crear la cuenta demo para Apple en Supabase Dashboard (Authentication → Users → Add User) y cargarla en App Store Connect → App Review Information
- [ ] Cargar `https://agroconecta.com.py/politica` como Privacy Policy URL en Play Console y App Store Connect
- [ ] Generar el primer build de producción con EAS y subirlo a Play Store / App Store

### Pendiente
- [ ] Correr `supabase/fix-ecosystem-listings.sql` en Supabase (crea `ecosystem_listings` + carga datos de ejemplo) — Empleos/Clasificados/Cursos ya no muestran "Próximamente" (revertido 2026-08, ver entrada arriba), pero sin correr este SQL la app cae al fallback mock local. Falta construir el panel admin para cargar/editar publicaciones reales (hoy solo vía SQL/Supabase Studio).
- [ ] Correr `supabase/fix-organizer-events-and-notify.sql` en Supabase si todavía no se corrió (necesario para eventos por organizador + campanita)
- [ ] Cuenta de Resend + secrets `RESEND_API_KEY`/`SERVICE_LEAD_EMAIL_TO` para que el email de leads (servicios, oportunidad comercial, interés en Ecosistema) funcione de punta a punta — hoy el insert en Supabase ya funciona, falta el aviso por mail
- [ ] Formularios de publicación desde la app móvil (hoy solo desde web admin)
- [ ] Tests (no hay suite todavía — evaluar si vale la pena antes de crecer más el código)
- [ ] Hidratación remota completa del perfil al iniciar sesión en un dispositivo sin AsyncStorage local
- [ ] Observabilidad/telemetría de errores Supabase en producción

Descartado (decisión de producto, 2026-07-14): próximas plataformas del ecosistema AgroClima, AgroMercado y AgroTV — no se van a construir.
