# Agroconecta — MVP Implementation Notes

Ultima actualizacion: 2026-07-14

Este documento resume el estado de implementacion actual. Para convenciones generales usar `AGENTS.md` y `CLAUDE.md`; para roadmap usar `docs/ESTRUCTURA-Y-ROADMAP.md`.

## Proyectos

```bash
# App movil
cd mobile
npm install
npm start
npm run tsc

# Web publica + admin
cd web
npm install
npm run dev
npm run build
```

## Variables de entorno

Mobile (`mobile/.env.local` o entorno Expo):

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_EVENTS_SUPABASE_URL=
EXPO_PUBLIC_EVENTS_SUPABASE_ANON_KEY=
```

Web/admin (`web/.env.local` y servidor):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
SERVICE_LEAD_EMAIL_TO=
```

Si faltan env vars en mobile, el cliente muestra warning y varias pantallas pueden caer a datos mock/desarrollo. No tratar ese fallback como comportamiento final de produccion.

## Modelo actual

- `Organization` es la entidad de cuenta/publicador/aliado.
- `Post` unifica articulos, videos, remates y avisos institucionales.
- `MarketPrice` unifica precios ganaderos e internacionales.
- `UserProfile` vive localmente en AsyncStorage como cache y se sincroniza best-effort a Supabase al completar onboarding o editar perfil.
- `organizationSubscriptions` es la lista canonica de organizaciones seguidas; `mediaPreferences` queda como alias de compatibilidad.

## Supabase

Aplicar primero `supabase/schema.sql` y luego seeds/migraciones necesarias (`seed.sql`, `seed-*.sql`, `fix-*.sql`). La app y la web comparten el Supabase principal. Eventos usa un Supabase externo separado, por eso los cruces evento-noticia se hacen por `event_tag`, no por FK.

Tablas principales usadas por mobile/web:

- `profiles`
- `organizations`
- `organization_members`
- `posts`
- `user_interests`
- `user_subscriptions`
- `market_prices`
- `push_tokens`
- `ad_campaigns`
- `library_items`
- `user_library`
- `event_schedule_items`

Storage relevante:

- `organization-logos`
- `banners`
- `post-images`
- `library-covers`
- `library-files` privado con signed URLs

## MVP mobile implementado

- Home feed con destacados, busqueda, secciones de eventos/ecosistema/organizaciones y banners.
- Auth con email/password, OTP y Google OAuth.
- Onboarding con datos de perfil, intereses y suscripciones.
- Precios desde `market_prices`.
- Videos/remates y detalle de video.
- Eventos desde Supabase externo, detalle/hub con programa y noticias relacionadas.
- Biblioteca digital con guardados de usuario y signed URL para archivos privados.
- Perfil con edicion, preferencias, notificaciones y tema.
- Push token registration listo y prompt propio antes del prompt nativo.

## Notas de calidad

- `mobile/lib/supabase-repositories.ts` es la frontera de datos: cualquier columna nueva debe mapearse ahi antes de llegar a UI.
- Evitar `any`; usar interfaces de fila para datos Supabase y tipos de dominio para la app.
- `npm run tsc` en `mobile/` debe quedar limpio antes de cerrar una sesion.
- No usar la salida mojibake de PowerShell como prueba de encoding roto; verificar con Node/bytes si hay duda.
