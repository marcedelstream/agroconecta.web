# AGROCONECTA — Codex Session Guide

Ultima actualizacion: 2026-07-14

## Que es este proyecto

Agroconecta es un ecosistema digital agropecuario para Paraguay. Centraliza noticias, precios de mercado, videos/remates, eventos, biblioteca digital, aliados y productos del ecosistema para productores, veterinarios, agronomos, comunicadores y otros profesionales del agro paraguayo.

El repo es un monorepo con tres piezas principales:

| Pieza | Carpeta | Stack | Estado |
|---|---|---|---|
| App movil | `mobile/` | React Native 0.83 + Expo SDK 55 + Expo Router | Funcional, `npm run tsc` limpio |
| Web publica + admin | `web/` | Next.js 16 App Router + Tailwind | Funcional, deploy Hostinger/GitHub Actions |
| Backend | `supabase/` | Supabase Postgres/Auth/Storage + SQL migrations | Operativo |

`mobile/` y `web/` son proyectos autocontenidos: cada uno tiene su propio `package.json`, dependencias y comandos. Los archivos web originales fuera de `web/` no son fuente de verdad.

## Stack real de mobile

| Capa | Tecnologia |
|---|---|
| Framework | Expo `~55`, React Native `0.83`, React `19` |
| Router | Expo Router `~55` con rutas file-based |
| Styling | NativeWind v4 + StyleSheet + tokens propios |
| Estado | React Context API (`lib/app-context.tsx`, `lib/theme-context.tsx`) |
| Backend client | `@supabase/supabase-js` v2 |
| Auth | Supabase Auth: email/password, OTP email, Google OAuth |
| Persistencia local | AsyncStorage (`@agroconecta:user`, `@agroconecta:theme`) |
| Tipos | TypeScript estricto |
| Iconos | `@expo/vector-icons` / Ionicons |
| Fuentes | Lexend como unica familia; las claves legacy `poppins`/`dmSans` apuntan a Lexend |
| Notificaciones | `expo-notifications`, tabla `push_tokens` |

## Estructura actual

```txt
AGROCONECTA APP/
├── mobile/                  # App Expo
│   ├── app/                 # Expo Router
│   │   ├── _layout.tsx      # Providers, fonts, splash nativo, push prompt
│   │   ├── index.tsx        # Splash visual y decision inicial
│   │   ├── (auth)/login.tsx
│   │   ├── (onboarding)/index.tsx
│   │   ├── (main)/(tabs)/   # home, prices, ecosystem, profile
│   │   ├── (main)/          # events, videos, library, article, publisher, etc.
│   │   ├── legal/           # terms/privacy
│   │   └── article|publisher direct routes
│   ├── components/          # ui, home, navigation, profile, library
│   ├── constants/           # colors, typography, spacing
│   ├── lib/                 # contextos, tipos, repositorios Supabase, utils
│   ├── assets/              # logos, iconos, splash, banners demo
│   └── app.json/eas.json/tsconfig/etc.
├── web/                     # Web publica + admin Next.js
├── supabase/                # schema.sql, seed.sql, fix-*.sql
├── docs/                    # roadmap, MVP, buckets, notas tecnicas
├── CLAUDE.md                # Guia amplia del proyecto
└── AGENTS.md                # Esta guia corta para agentes
```

## Backend y datos

- Supabase principal: perfiles, organizaciones, publicaciones, precios, banners, biblioteca, suscripciones, push tokens.
- Supabase externo de eventos: `mobile/lib/supabase-events.ts`, usado para eventos de eventosagropy.com.
- Acceso mobile: `mobile/lib/supabase.ts` crea el cliente; `mobile/lib/supabase-repositories.ts` concentra queries y mapea snake_case DB a camelCase TS.
- Los mapeadores de repositorios tienen interfaces de fila locales (`PostRow`, `OrganizationRow`, etc.) y normalizan `null` a `undefined`/fallbacks antes de salir al dominio.
- `mobile/lib/app-context.tsx` mantiene AsyncStorage como cache local de perfil, pero al completar onboarding o editar perfil sincroniza best-effort a Supabase (`profiles`, `user_interests`, `user_subscriptions`) cuando el usuario tiene UUID valido.

## Design system

Usar siempre tokens existentes:

- Colores: `mobile/constants/colors.ts`
- Tipografia: `mobile/constants/typography.ts`
- Spacing/radius: `mobile/constants/spacing.ts`
- Texto base: `mobile/components/ui/Text.tsx`
- Botones/cards/badges base: `mobile/components/ui/`

Tema actual: **light default** desde 2026-07, con dark disponible desde perfil. No asumir dark default aunque los tokens dark sigan siendo importantes para compatibilidad.

## Reglas de desarrollo

1. Trabajar dentro de `mobile/` para app Expo y dentro de `web/` para web/admin.
2. TypeScript estricto: no introducir `any`; para datos externos crear tipos de frontera y mapear a tipos de dominio.
3. UI en espanol con contexto paraguayo. Mantener textos con UTF-8 real; si PowerShell muestra `Ã¡`, verificar bytes antes de editar.
4. No tocar UI/estilos si el pedido es de backend, datos o documentacion.
5. No hardcodear colores nuevos en pantallas; usar `Colors`/`useColors`.
6. Mantener AsyncStorage como cache local, pero preferir Supabase como fuente persistente para datos de usuario reales.
7. `mock-data.ts` es fallback/desarrollo, no fuente de verdad de produccion.
8. Antes de terminar cambios mobile, correr `cd mobile && npm run tsc`.
9. Hay cambios locales posibles del usuario; no revertir archivos no relacionados.

## Comandos utiles

```bash
# Mobile
cd mobile
npm start
npm run android
npm run ios
npm run web
npm run tsc
npx expo start --clear

# EAS
cd mobile
eas build --profile development --platform android
eas build --profile production --platform android

# Web
cd web
npm run dev
npm run build
npm run start
```

## Estado funcional resumido

Mobile:
- Auth Supabase, OTP, Google OAuth.
- Splash, onboarding, perfil, tema claro/oscuro.
- Home/feed, detalle de articulo, publishers/organizaciones.
- Precios, eventos, videos/remates, ecosistema, biblioteca, aliados, contacto, legales.
- Push notifications con registro de token y tap-to-open.

Web/admin:
- Home publica, noticias, precios, ecosistema, quienes somos.
- Admin para publicaciones, organizaciones, precios, banners, eventos, biblioteca, notificaciones y consultas.

Pendientes relevantes:
- Tests automatizados.
- Primer build EAS de produccion validado en dispositivo real.
- Hidratacion remota completa de perfil al iniciar sesion en un dispositivo sin AsyncStorage local.
- Mejor observabilidad de errores Supabase en produccion.
