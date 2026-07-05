# AGROCONECTA — Claude Code Session Guide

## Qué es este proyecto

**Agroconecta** es un ecosistema digital agropecuario para Paraguay. Centraliza noticias, precios de mercado, videos y productos del ecosistema para productores, veterinarios, agrónomos, comunicadores y demás profesionales del agro paraguayo.

Es un **monorepo** con tres piezas que comparten el mismo backend (Supabase). `mobile/` y `web/` son proyectos
totalmente independientes — cada uno con su propio `package.json`, `node_modules` y tooling:

| Pieza | Carpeta | Stack | Estado |
|---|---|---|---|
| **App móvil** | `mobile/` | React Native + Expo SDK 55 | Funcional, compila sin errores |
| **Web pública + admin** | `web/` | Next.js 16 (App Router) | Funcional, deploy en Hostinger |
| **Backend** | `supabase/` | Supabase (Postgres + Auth + Storage) | Operativo |

> El panel `admin-web/` antiguo quedó como referencia y **no se deploya**. La fuente de verdad para producción web es `web/`.
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
| Auth | Supabase Auth (email/password) |
| Persistencia | AsyncStorage (`@agroconecta:user`) |
| Tipos | TypeScript estricto (`npm run tsc` pasa limpio) |
| Íconos | `@expo/vector-icons` (Ionicons) |
| Fuentes | Poppins + DM Sans (`@expo-google-fonts`) |
| Validación | Zod + React Hook Form |
| Extras | expo-haptics, expo-image, expo-linear-gradient, expo-notifications, react-native-webview, react-native-reanimated 4 |

### Web (`web/`)

| Capa | Tecnología |
|---|---|
| Framework | Next.js `^16` (App Router, SSR dinámico) |
| Styling | Tailwind CSS 3 |
| Backend | `@supabase/ssr` + `@supabase/supabase-js` |
| Auth admin | Supabase Auth (cookies SSR) |
| Deploy | Hostinger Cloud (PM2 + nginx), CI/CD via GitHub Actions |

---

## Backend — Supabase

- **URL:** `https://ukodavvtmrrqnfgyvqql.supabase.co`
- **Credenciales:** en `.env.local` (móvil) y `.env.production` en el servidor (web). Gitignoreado.
- **Tablas:** `profiles`, `organizations`, `organization_members`, `posts`, `user_interests`, `user_subscriptions`, `market_prices`, `push_tokens`, `ad_campaigns`
- **Storage buckets:** `organization-logos`, `banners`, `post-images`
- **Esquema y seed:** `supabase/schema.sql`, `supabase/seed.sql` + scripts `fix-*.sql` para migraciones puntuales
- **Acceso desde la app:** `mobile/lib/supabase.ts` (cliente) y `mobile/lib/supabase-repositories.ts` (queries tipadas: posts, organizations, market_prices, events, banners). Los repos mapean snake_case de la DB → camelCase de los tipos TS.

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
├── DEPLOY.md                     # Guía de deploy Hostinger + CI/CD
├── AGENTS.md                     # Notas para agentes
└── .github/workflows/deploy-web.yml  # CI/CD a Hostinger (build corre en CI, solo sube el resultado de web/)
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

- **Display / Títulos:** Poppins (300–700)
- **Body / UI:** DM Sans (400–700)

### Border radius

`sm` 8 · `md` 10 · `base`/`lg` 12 · `xl` 16

### Spacing

Múltiplos de 4. Base unit = 4px.

---

## App móvil — pantallas y flujo

### 1. Splash
Logo + animación, decide ruta inicial (onboarding si no hay usuario, main si ya hay).

### 2. Auth + Onboarding
- Login Supabase (`mobile/app/(auth)/login.tsx`).
- Onboarding recoge: **nombre, email, teléfono, profesión, departamento, preferencias de noticias, suscripciones a organizaciones/medios**.
- Al completar: crea `UserProfile`, lo persiste en AsyncStorage y marca `isComplete`.

### 3. Main — Bottom Tabs (5 tabs)

| Tab | Descripción |
|---|---|
| Inicio | Feed de noticias con filtros, búsqueda y anuncios segmentados |
| Precios | Precios ganaderos (PYG ₲) + commodities internacionales (USD $) |
| Videos | Videos y remates (YouTube embeds / WebView) |
| Ecosistema | Plataformas propias + medios + instituciones |
| Perfil | Datos del usuario, tema, notificaciones, preferencias |

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
2. **TypeScript estricto** — sin `any` en código nuevo (los repos legacy usan `any` en el mapeo de filas; no copiar ese patrón fuera de ahí).
3. **Español** — toda la UI en español, contexto paraguayo.
4. **Mobile-first** — referencia 390px (iPhone 14 Pro).
5. **Sin comentarios obvios** — comentar el *por qué*, no el *qué*.
6. **Componentes chicos** — dividir si superan ~150 líneas.
7. **Constants extraídas** — nunca hardcodear colores ni strings.
8. **Moneda:** ganadero en PYG (₲), commodities en USD ($).
9. **Datos:** preferir los repositorios de Supabase; `mock-data.ts` es solo fallback/desarrollo.

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

## Estado del proyecto (2026-07-03)

### App móvil — ✅ funcional
- [x] Scaffold Expo Router + design system (tokens + componentes base)
- [x] Splash, login Supabase, onboarding multi-paso con persistencia AsyncStorage
- [x] Tabs: Home, Precios, Videos, Ecosistema, Perfil
- [x] Detalle de artículo, perfil de organización, WebView in-app
- [x] Eventos: listado, detalle, hub dinámico (Info + Programa + Noticias), recordatorios push
- [x] Repositorios Supabase (posts, organizations, market_prices, events, banners)
- [x] Segmentación de anuncios por profesión/departamento/categoría; banners con destino clickeable (evento/post/URL)
- [x] Notificaciones push activas de punta a punta (registro de token + tap-to-open)
- [x] Tema claro/oscuro
- [x] `npm run tsc` pasa sin errores
- [x] EAS configurado (`mobile/eas.json`) — falta generar el primer build
- [x] Tema claro por defecto, grid de noticias 2 columnas + skeleton, legales, páginas de servicio, ecosistema editable desde admin, campanita persistida, eventos por organizador (2026-07-03)

### Web — ✅ funcional
- [x] Páginas públicas: home, noticias/[id] (SSR+OG), precios, ecosistema, quiénes-somos
- [x] Panel admin: login, publicaciones (aprobar/rechazar), organizaciones, precios, banners, eventos (programa + tagging de noticias), ecosistema (logos + disponibilidad)
- [x] SEO: robots.ts, sitemap.ts
- [x] Deploy Hostinger — build corre en GitHub Actions (no en el servidor), solo se sube el resultado compilado de `web/` en modo standalone
- [x] Endpoint `POST /api/service-lead` listo para enviar los leads de servicio por email vía Resend (falta cargar `RESEND_API_KEY`/`SERVICE_LEAD_EMAIL_TO`)

### Pendiente
- [ ] Cursos (listado + inscripción) — diseño en `docs/ESTRUCTURA-Y-ROADMAP.md`
- [ ] Biblioteca digital tipo Netflix (colección de libros) — diseño en `docs/ESTRUCTURA-Y-ROADMAP.md`
- [ ] Generar el primer development/production build con EAS
- [ ] Correr `supabase/fix-ecosystem-sites.sql` y `supabase/fix-organizer-events-and-notify.sql` en Supabase, y cargar el ecosistema desde `/admin/ecosistema`
- [ ] Cuenta de Resend + secrets `RESEND_API_KEY`/`SERVICE_LEAD_EMAIL_TO` para que el email de leads funcione de punta a punta
- [ ] Próximas plataformas del ecosistema: AgroClima, AgroMercado, AgroTV
- [ ] Formularios de publicación desde la app móvil (hoy solo desde web admin)
- [ ] Tests (no hay suite todavía)
