# AGROCONECTA — Claude Code Session Guide

## Qué es este proyecto

**Agroconecta** es un ecosistema digital agropecuario para Paraguay. Centraliza noticias, precios de mercado, videos y productos del ecosistema para productores, veterinarios, agrónomos, comunicadores y demás profesionales del agro paraguayo.

Es un **monorepo** con tres piezas que comparten el mismo backend (Supabase):

| Pieza | Carpeta | Stack | Estado |
|---|---|---|---|
| **App móvil** | `app/` + `components/` + `lib/` | React Native + Expo SDK 55 | Funcional, compila sin errores |
| **Web pública + admin** | `web/` | Next.js 16 (App Router) | Funcional, deploy en Hostinger |
| **Backend** | `supabase/` | Supabase (Postgres + Auth + Storage) | Operativo |

> El panel `admin-web/` antiguo quedó como referencia y **no se deploya**. La fuente de verdad para producción web es `web/`.

---

## Stack tecnológico (real, no target)

### App móvil (`app/`)

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
- **Acceso desde la app:** `lib/supabase.ts` (cliente) y `lib/supabase-repositories.ts` (queries tipadas: posts, organizations, market_prices). Los repos mapean snake_case de la DB → camelCase de los tipos TS.

---

## Estructura de carpetas

```
AGROCONECTA APP/
├── app/                          # App móvil — Expo Router (rutas file-based)
│   ├── _layout.tsx               # Root: fonts, AppProvider, ThemeProvider, splash
│   ├── index.tsx                 # Entry → splash → onboarding o main
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx             # Login Supabase
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   └── index.tsx             # Flujo onboarding (nombre, email, profesión, depto, prefs, subs)
│   ├── (main)/                   # Bottom tabs
│   │   ├── _layout.tsx
│   │   ├── home.tsx              # Feed de noticias
│   │   ├── prices.tsx            # Precios ganaderos + commodities
│   │   ├── videos.tsx            # Videos / remates
│   │   ├── ecosystem.tsx         # Ecosistema digital
│   │   ├── profile.tsx           # Perfil
│   │   ├── webview.tsx           # WebView in-app
│   │   ├── article/              # Detalle de artículo (dentro de tabs)
│   │   └── publisher/            # Perfil de organización
│   ├── article/[id].tsx          # Detalle de artículo (ruta directa)
│   └── publisher/[id].tsx        # Perfil de organización (ruta directa)
│
├── components/
│   ├── ui/                       # Design system base (Button, Card, Badge, Text, AdBanner, …)
│   ├── screens/                  # Pantallas compuestas (home, prices, ecosystem, profile, onboarding, splash, main)
│   ├── home/                     # FeaturedCard, NewsCard, SectionHeader
│   ├── navigation/               # AppHeaderBar, bottom-tabs, DrawerMenu, FilterSheet
│   ├── profile/                  # Sheets: EditProfile, Appearance, Notifications, Preferences, Settings, Media
│   └── theme-provider.tsx
│
├── lib/                          # Lógica compartida móvil
│   ├── types.ts                  # TODOS los tipos del dominio
│   ├── app-context.tsx           # Estado global: auth + onboarding + user
│   ├── theme-context.tsx         # Tema claro/oscuro
│   ├── supabase.ts               # Cliente Supabase
│   ├── supabase-repositories.ts  # Queries: posts, organizations, market_prices
│   ├── ad-segments.ts            # Segmentación de anuncios
│   ├── push-notifications.ts     # Helper push (no cableado aún)
│   ├── feed-types.ts / feed-utils.ts
│   ├── mock-data.ts              # Datos de fallback / desarrollo
│   └── utils.ts
│
├── web/                          # Web pública + admin (Next.js 16)
│   ├── app/
│   │   ├── page.tsx              # Home (feed)
│   │   ├── noticias/[id]         # Detalle SSR + Open Graph
│   │   ├── precios/              # Precios públicos
│   │   ├── ecosistema/           # Ecosistema
│   │   ├── quienes-somos/
│   │   ├── api/ · auth/ · robots.ts · sitemap.ts
│   │   └── admin/
│   │       ├── (auth)/login      # Login admin
│   │       └── (dashboard)/      # publicaciones, organizaciones, precios, banners
│   ├── components/               # Header, Footer, NewsCard, AdBanner, ThemeToggle, …
│   ├── lib/                      # supabase-{browser,server,admin}.ts, auth-roles.ts, seo.ts
│   └── ecosystem.config.js       # PM2
│
├── supabase/                     # schema.sql, seed.sql, fix-*.sql
├── constants/                    # colors.ts, typography.ts, spacing.ts
├── hooks/                        # Custom hooks
├── assets/                       # fonts + images
├── docs/                         # mvp-implementation.md, supabase-buckets-banners.md
├── DEPLOY.md                     # Guía de deploy Hostinger + CI/CD
├── AGENTS.md                     # Notas para agentes
└── .github/workflows/deploy-web.yml  # CI/CD a Hostinger (push a main que toque web/)
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
- Login Supabase (`app/(auth)/login.tsx`).
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

> La fuente de verdad es `lib/types.ts`. Resumen de lo importante (puede expandirse — leer el archivo antes de tocar tipos):

- **`Profession`** y **`Department`** son **slugs en kebab-case** (`'agronomo'`, `'alto-parana'`), no nombres de display. La capa de UI mapea slug → etiqueta legible.
- **`Post`** unifica artículos, videos, remates y avisos institucionales vía `contentType` + `editorialStatus` (`draft | pending_review | published | rejected | archived`). `NewsArticle = Post`.
- **`Organization`** (= `Publisher`) tiene `commercialStatus` (`trial | active | overdue | paused`) y `planName` — modelo B2B.
- **`MarketPrice`** unifica precios; también existen `CattlePrice` e `InternationalPrice`.
- **`AdCampaign` / `MockAd` / `AdSegment`** modelan anuncios segmentados por profesión, departamento y categorías.
- **`UserProfile`** incluye `organizationSubscriptions`, `mediaPreferences`, `notificationPrefs`.

---

## Reglas de desarrollo

1. **Dark theme como default**; el tema claro existe vía `theme-context`.
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
# --- App móvil (raíz del repo) ---
npm start              # expo start
npm run android        # expo run:android
npm run ios            # expo run:ios
npm run web            # expo start --web
npm run tsc            # tsc --noEmit (typecheck)
npx expo start --clear # limpiar caché

# --- Web (cd web) ---
npm run dev            # next dev -p 3000  → /admin para el panel
npm run build          # next build
npm run start          # next start -p 3000
```

> **No hay git inicializado** en la raíz todavía. El flujo de deploy de `DEPLOY.md` asume un repo en GitHub con CI/CD a Hostinger — falta hacer `git init` + primer push si se quiere activar el pipeline.

---

## Estado del proyecto (2026-06-09)

### App móvil — ✅ funcional
- [x] Scaffold Expo Router + design system (tokens + componentes base)
- [x] Splash, login Supabase, onboarding multi-paso con persistencia AsyncStorage
- [x] Tabs: Home, Precios, Videos, Ecosistema, Perfil
- [x] Detalle de artículo, perfil de organización, WebView in-app
- [x] Repositorios Supabase (posts, organizations, market_prices)
- [x] Segmentación de anuncios por profesión/departamento/categoría
- [x] Tema claro/oscuro
- [x] `npm run tsc` pasa sin errores

### Web — ✅ funcional
- [x] Páginas públicas: home, noticias/[id] (SSR+OG), precios, ecosistema, quiénes-somos
- [x] Panel admin: login, publicaciones (aprobar/rechazar), organizaciones, precios, banners
- [x] SEO: robots.ts, sitemap.ts
- [x] Deploy Hostinger (PM2 + nginx) + CI/CD GitHub Actions

### Pendiente
- [ ] Notificaciones push cableadas (helper en `lib/push-notifications.ts`, tabla `push_tokens` lista)
- [ ] `git init` + repo remoto para activar el CI/CD descrito en DEPLOY.md
- [ ] Próximas plataformas del ecosistema: AgroClima, AgroMercado, AgroTV
- [ ] Formularios de publicación desde la app móvil (hoy solo desde web admin)
- [ ] Tests (no hay suite todavía)
