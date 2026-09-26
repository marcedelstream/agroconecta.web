# Agroconecta v2 — Plan de implementación (feed vertical)

> 2026-09-25 · Rama `feature/v2-feed-redesign` (sale de `main` @ `bccc015`, tag `v1-diseno-final`).
> Estado: **aprobado 2026-09-25**. Bloques 1a (flag, tokens v2, Figtree, barra flotante) 1b (migración + `/api/feed` + ranking con tests) y 1c (feed vertical en mobile) hechos. 1c provisorio: el botón de acción abre las pantallas de detalle v1 hasta que exista la ficha (1d).
> Base: `README.md`, `BACKEND-Y-DATOS.md`, `ONBOARDING-V2.md` de este paquete + auditoría del código real.

---

## 0. Hallazgos de la auditoría que cambian el handoff (leer primero)

| # | Qué dice el handoff | Qué hay en el código | Propuesta |
|---|---|---|---|
| H1 | `feed_candidates` / `get_feed` en Postgres unen posts + **eventos** + listings. | Los **eventos no están en nuestra base**: vienen del Supabase externo de eventosagropy.com. Una RPC no puede hacer join con otra base. | ✅ **Resuelto (1b):** el feed lo arma `web/app/api/feed` (Next.js, igual que Karai), que lee las dos bases, así que no hace falta copiar los eventos. El ranking es TypeScript puro en `web/lib/feed/ranking.ts`, con tests en vitest. Los pesos siguen en la tabla `feed_weights`. Requiere `EVENTOS_SUPABASE_URL`/`EVENTOS_SUPABASE_ANON_KEY` en Vercel. |
| H2 | Video con autoplay silenciado a pantalla completa (`expo-video`). | Los videos son **YouTube** (`posts.youtube_url`), en su mayoría horizontales. No hay MP4 propio. `/api/shorts` trae Shorts verticales del canal. | **No agregar `expo-video` en la Fase 1.** Item de video = miniatura a pantalla completa + play. Solo el item visible monta **un** `YoutubeIframe` (nunca más de uno montado). Los Shorts (verticales) se reproducen a pantalla completa. `expo-video` entra cuando haya video propio en Storage. |
| H3 | Fotos verticales 1080×1920. | Todo el contenido actual tiene `image_url` horizontal. | Fallback en `FeedBackground`: si la imagen es apaisada (relación > 0,8), va de fondo la **misma imagen desenfocada** a pantalla completa y adelante la imagen `contain`, arriba del degradado. Con eso el contenido viejo se ve bien sin volver a cargar nada. `media_focal_point` + recorte guiado en el admin quedan para después (Fase 4/6). |
| H4 | Tablas `follows`, `content_likes`, `content_saves`. | `user_subscriptions (user_id, organization_id)` **ya es "follows"**: misma semántica, ya la usa el onboarding y la sincroniza `app-context`. No hay likes. Guardados solo existe para la biblioteca (`user_library`). | **Reutilizar `user_subscriptions` como follows** (sin renombrarla). Crear `content_likes` y `content_saves` genéricas (`source`, `source_id`). `user_library` sigue igual (tiene progreso de lectura) y Guardados la muestra junto con lo demás. |
| H5 | `ad_campaigns`: agregar placements `feed` y `article_inline`. | `placement` es `text[]` (`fix-ad-campaigns-placement.sql`): alcanza con valores nuevos, **sin cambiar el schema**. | Solo agregar las opciones en el admin de banners + `ad_events`. Mobile ya usa el placement `article`: se reemplaza por `article_inline` en la ficha v2. |
| H6 | "Hidratación remota del perfil = requisito Fase 1". | Ya existe `hydrateProfileFromSupabase()` en `app-context.tsx` (parcial). | Completarla (intereses, suscripciones, `notification_prefs`, facets nuevos), no escribirla de cero. |
| H7 | Karai mobile consume `/api/karai/chat` con JWT. | `web/lib/karai/auth.ts` **ya autentica por `Authorization: Bearer <jwt>`** (mismo patrón que `delete-account`). El orquestador ya devuelve `ReadableStream`. | Mobile llama directo con el JWT de sesión. Streaming con `expo/fetch` (SDK 55 soporta `response.body` como stream); se valida en un dispositivo al arrancar la Fase 3, y si falla se pasa a respuesta completa + "escribiendo…". |
| H8 | Flag `EXPO_PUBLIC_FEED_V2` para "volver a la home v1". | La v2 no cambia solo la home: cambia **toda la barra de tabs** (5 destinos en vez de Inicio/Ecosistema + botón "+"). | El flag se lee en `(main)/(tabs)/_layout.tsx` y elige **qué conjunto de tabs** se muestra (v1 o v2). Las pantallas v2 van en archivos nuevos y las que no corresponden quedan con `href: null`. `mobile/lib/feature-flags.ts` centraliza la lectura. |
| H9 | Perfil público en `web/app/[slug]` o `/u/[slug]`. | Un `[slug]` en la raíz choca con las rutas actuales (`/precios`, `/karai`, `/politica`…) y con slugs futuros. | **`/u/[slug]`**, sin discusión técnica: Marce solo decide la visibilidad. |
| H10 | Métricas D1/D7/D30, CTR, etc. | No hay herramienta de analítica en mobile. | `feed_events` + vistas SQL para las métricas. No suma un SDK externo en la Fase 1 (menos dependencias, sin tema de privacidad nuevo). |
| H11 | Onboarding: el paso 2 "rubros" alimenta `w_int`. | `user_interests (user_id, category)` guarda las categorías de noticias de la v1. | Tabla nueva `user_profile_facets (user_id, facet, value)` para rubros, cultivos/especies, objetivos y escala. `user_interests` se mantiene por compatibilidad con la v1 y con la segmentación de anuncios. |

---

## 1. Mapa de rutas actual → v2

Leyenda: **R** reutiliza · **C** cambia · **N** nueva · **M** se mueve · **X** se retira (solo con el flag v2 activo, el archivo no se borra hasta el lanzamiento).

| Ruta actual (`mobile/app/…`) | v2 | Destino |
|---|---|---|
| `(main)/(tabs)/_layout.tsx` | C | Elige tabs v1/v2 según el flag. v2 = `FloatingTabBar` con 5 destinos. |
| `(main)/(tabs)/home.tsx` (tablero) | C/X | Con el flag v2 → `feed.tsx` (N). El tablero v1 queda intacto para el flag apagado. |
| — | N | `(tabs)/feed.tsx`, `(tabs)/explorar.tsx`, `(tabs)/karai.tsx`, `(tabs)/guardados.tsx` |
| `(tabs)/profile.tsx` | C | Perfil CV v2 (`profile-v2.tsx` detrás del flag) + menú "Más". |
| `(tabs)/prices.tsx` | R/M | Queda como ruta navegable (fuera de la barra), se abre desde la tarjeta "Tu mercado hoy", desde Explorar y desde las refs de Karai. **Ver decisión D1.** |
| `(tabs)/noticias.tsx` | R/M | Explorar → Noticias la abre tal cual (después se le cambia la cabecera). |
| `(tabs)/ecosystem.tsx` | M | Se reparte en Explorar → Empleos/Productos/Servicios/Cursos/Remates. `ListingCard` y `listing/[id]` se reutilizan. |
| `(tabs)/publish.tsx` (botón "+") | M | Sale de la barra y pasa a Perfil → "Más" → Publicar (misma lógica: miembro → `publish-form`, resto → `sumate`). |
| `article/[id]`, `(main)/article/[id]` | C | La ficha v2 es `DetailSheet`. La ruta de artículo sigue para deep links y push, y abre la misma ficha. |
| `event/[slug]` (hub) | R | Es la vista "Ver evento" (el README lo pide así). |
| `videos.tsx`, `video/[id]` | R | Explorar → Videos/Remates. |
| `events.tsx` | R | Explorar → Eventos. |
| `library.tsx`, `book/[id]` | R | Explorar (bloque Biblioteca) + Guardados. |
| `listing/[id]`, `ecosistema/[slug]`, `service/[slug]` | R | Desde Explorar y desde los CTA de producto/servicio/empleo. |
| `aliados`, `contacto`, `nosotros`, `sumate`, `media-subscriptions`, `legal/*`, `webview`, `publisher/[id]` | R | Perfil → "Más" (hoja inferior). |
| `(auth)/login.tsx`, `auth/callback.tsx` | R | Sin cambios (Google / OTP / email+contraseña). |
| `(onboarding)/index.tsx` | C | Onboarding v2 (Fase 2), `resolveProfileForCurrentSession()` **no se toca**. |
| `components/navigation/DrawerMenu` | X (v2) | No existe en la v2: su contenido pasa a Perfil → "Más". |

**No se pierde ninguna función de la v1.** Todo lo que se "retira" se retira solo con el flag v2, y el archivo se borra recién en el lanzamiento, con tu OK.

---

## 2. Agregar / cambiar / eliminar / reutilizar, por área

| Área | Agregar | Cambiar | Eliminar | Reutilizar |
|---|---|---|---|---|
| Navegación | `FloatingTabBar`, `GlassSurface`, `feature-flags.ts` | `(tabs)/_layout.tsx` | Botón "+" y drawer (con v2) | Expo Router, `href: null` |
| Feed | `FeedPager`, `FeedItem` + variantes, `FeedBackground`, `ActionRail`, `FollowAvatar`, `ContentCTA`, `TypeChip`, `MarketFeedCard`, `lib/feed-v2/` (cliente, cola de eventos, precarga) | — | — | `PriceBoard` (dentro de la tarjeta de mercado), `feed-types.ts` (se amplía) |
| Detalle | `DetailSheet`, `InlineAdBlock` | Ruta de artículo → abre la ficha | — | `HtmlContent`, `ReminderModal` (lógica), hub de eventos |
| Explorar | Pantalla, `LiveRow`, grilla de categorías, tendencias | — | — | `FilterSheet`, `ListingCard`, `NewsCard` (lista de resultados) |
| Karai | Tab `karai.tsx`, `KaraiRefCard`, `lib/karai-client.ts` | Orquestador web: devolver `refs` | — | `/api/karai/*`, `AIProvider`, cuota, `notify-interest` |
| Guardados | Pantalla + `SegmentedControl`, `ReminderSwitch` | — | — | `user_library`, recordatorios push de eventos |
| Perfil | Perfil CV, `PointsCard` (Fase 2), hoja "Más" | `EditProfileSheet` (campos CV) | — | Sheets actuales (notificaciones, ajustes, borrar cuenta) |
| Canjes | Pantalla, `RewardCard` | — | — | — |
| Onboarding | Pasos nuevos (rubros, cultivos, objetivos, follows sugeridos, consentimiento) | `(onboarding)/index.tsx` (se divide en pasos <150 líneas) | Paso "medios" (lo reemplaza "seguí organizaciones") | Pasos nombre/profesión/departamento/WhatsApp |
| Tipografía | `@expo-google-fonts/figtree` (si D2 = sí) | `constants/typography.ts` (mismo truco de claves) | `noto-sans` (con v2) | Mapeo de claves |
| Tokens | `Colors.v2` (namespace nuevo) | — | — | `Colors.redesign` queda para la v1 |
| Backend | Ver sección 3 | `ad_campaigns.placement` (valores) | — | `user_subscriptions`, `push_tokens`, `notification_prefs`, `service_leads`, `consents` |
| Admin web | Encuestas/quiz, pesos del feed, en vivo, reporte de anuncios, premios y validación de códigos | Banners (placements nuevos) | — | Admin actual |
| Web pública | `/u/[slug]` (Fase 5), `api/cron/sync-events`, `api/feed/events` (lote de telemetría, si no va directo por RPC) | — | — | — |
| Push | "Empezó el remate que seguís" | `sendPushToAll` (+ destinatarios por recordatorio) | — | `push_tokens`, tap-to-open |
| Analítica | `feed_events`, vistas de métricas | — | — | — |

---

## 3. Brechas de schema (propuesto vs. real)

Tablas que **ya existen**: `profiles`, `organizations`, `organization_members`, `posts`, `user_interests`,
`user_subscriptions`, `market_prices`, `push_tokens`, `ad_campaigns`, `service_leads`, `library_items`,
`user_library`, `event_schedule_items`, `event_media`, `ecosystem_listings`, `ecosystem_sites` (obsoleta),
`news_sources`, `conversations`, `conversation_messages`, `usage_ledger`, `consents`, `farm_profile`,
`karai_knowledge_sources`, `karai_leads`, `phone_identities`.

| Propuesta del handoff | ¿Existe? | Decisión | Migración |
|---|---|---|---|
| `follows` | **Sí, como `user_subscriptions`** | Reutilizar | — |
| `content_likes`, `content_saves` | No | Crear (genéricas por `source` + `source_id`) + contadores | `fix-v2-engagement.sql` (F1) |
| `feed_events` | No | Crear, particionable por mes más adelante | `fix-v2-feed.sql` (F1) |
| `feed_weights` | No | Crear, 1 fila por peso, editable desde el admin | `fix-v2-feed.sql` (F1) |
| `feed_candidates` (vista) + `get_feed` (RPC) | No | Vista sobre `posts` + `ecosystem_listings` + `external_events` (+ polls/quiz/ads desde F2/F4) | `fix-v2-feed.sql` (F1) |
| Eventos en la base | **No (base externa)** | Espejo `external_events` + cron | `fix-v2-external-events.sql` (F1) |
| `reminders` | No (los recordatorios de eventos hoy son notificaciones locales) | Crear, para que Guardados → Recordatorios sea persistente y sirva para el push del servidor | `fix-v2-engagement.sql` (F1) |
| `user_profile_facets` | No | Crear | `fix-v2-profile.sql` (F1, lo usa también el onboarding F2) |
| Campos CV + `slug` en `profiles` | No | Columnas en `profiles` (slug unique, cargo, formación, experiencia jsonb, especialidades, redes jsonb, visibilidad) | `fix-v2-profile.sql` (F1) |
| `polls`, `poll_options`, `poll_votes` | No | Crear | `fix-v2-polls-quiz.sql` (F2) |
| `quizzes`, `quiz_questions`, `quiz_answers` | No | Crear, `correct_option` en una tabla sin policy de lectura (solo la RPC `security definer` la lee) | `fix-v2-polls-quiz.sql` (F2) |
| `points_ledger` + `points_balance` | No | Crear, unique `(user_id, source, source_ref)` | `fix-v2-points.sql` (F2) |
| `is_live`, `stream_url` | No (hay `auction_status = 'live'` en posts) | Columnas en `external_events` + usar `auction_status` para los remates en posts | `fix-v2-live.sql` (F4) |
| `user_dismissals` | No | Crear | `fix-v2-live.sql` (F4) |
| `ad_events` | No | Crear | `fix-v2-ads.sql` (F4) |
| `posts.is_sponsored`, `posts.campaign_id` | No | Columnas | `fix-v2-ads.sql` (F4) |
| `rewards`, `reward_redemptions` | No | Crear + RPC transaccional `redeem_reward` | `fix-v2-rewards.sql` (F5) |
| `media_focal_point` | No | Columna en `posts` (jsonb `{x,y}`) | `fix-v2-media.sql` (F4/F6) |

Todas idempotentes (`if not exists`, `drop policy if exists` + `create policy`) y con RLS de dueño.
**Ninguna se corre en producción sin tu confirmación**: te paso el orden al final de cada fase.

---

## 4. Dependencias nuevas (mobile)

Todas se instalan con `npx expo install` para que tomen la versión que corresponde al SDK 55.

| Paquete | Para qué | Fase | Nota |
|---|---|---|---|
| `expo-blur` | Vidrio (`GlassSurface`, barra flotante) | F1 | En Android el blur real es caro y cambia según la versión: `GlassSurface` usa un fallback de color translúcido sólido en Android (y Material You en F6). |
| `@expo-google-fonts/figtree` | Tipografía v2 | F1 | **Solo si D2 = sí.** |
| `react-native-pager-view` | — | — | **No se agrega de entrada.** Se arranca con `FlatList` `pagingEnabled` + `getItemLayout` + `windowSize` chico (ya está todo instalado). Si no llega a 60 fps en el Android de gama media, se prueba pager-view (compatible con Expo) como plan B. |
| `expo-video` | Video propio | Después | No hace falta mientras el video sea YouTube (H2). |
| `react-native-sse` | Streaming de Karai | F3 | Solo si `expo/fetch` no streamea bien en un dispositivo real. |

Se reutilizan: `expo-image`, `expo-linear-gradient`, `expo-haptics`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-youtube-iframe`, `Share` de RN.

---

## 5. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| **60 fps del feed en Android de gama media** | `FlatList` con `getItemLayout` fijo (alto de pantalla), `windowSize` 3, `removeClippedSubviews`, items con `React.memo`, `expo-image` con `recyclingKey` + `prefetch` de las 2 imágenes siguientes, un solo reproductor de YouTube montado, blur solo en iOS, sin sombras grandes. Medición con Perf Monitor en un **dispositivo real de gama media** (¿cuál tenés a mano?) como criterio de la F1. |
| Alto del item ≠ pantalla (barra de Android, recortes, teclado) | Alto del item = alto medido del contenedor (`onLayout`), no `Dimensions`. La barra flotante va **sobre** el feed, no le resta alto. |
| Imágenes horizontales | Fallback con imagen desenfocada (H3). |
| YouTube en el feed | Miniatura + un solo iframe activo (H2). La reproducción automática de YouTube con sonido está bloqueada: arranca silenciado o a pedido del usuario. |
| Streaming de Karai en RN | `expo/fetch` → `react-native-sse` → respuesta completa (H7). |
| Costos de IA | Se mantiene la cuota de `usage_ledger`, el límite se muestra en la app, las refs salen de una búsqueda SQL (no de más tokens). |
| Antifraude de puntos | Todo por RPC `security definer`, unique en el ledger, solo con email verificado, tope diario en una tabla de configuración, `correct_option` nunca se expone. |
| Eventos desincronizados (base externa) | Cron cada 15 min + `synced_at` visible en el admin. Si falla, el feed sigue funcionando sin eventos nuevos. |
| Convivencia v1/v2 | Flag por tabs (H8). Los arreglos de v1 salen de `main` y se integran en la rama v2 con merge periódico, sin rebase. |
| Tamaño de los componentes | Cada variante de `FeedItem` en su propio archivo. Las pantallas grandes se dividen en subcomponentes desde el principio. |

---

## 6. Fases, criterios de aceptación y estimación relativa

Estimación en unidades relativas (S = 1, M = 2, L = 4, XL = 8).

### Fase 1 — Navegación + feed + pantallas base · **XL (la más grande)**
Se divide en sub-bloques, cada uno con un commit que deja la app compilando:

1a. Flag + tokens `Colors.v2` + tipografía (si D2) + `GlassSurface` + `FloatingTabBar` con 5 tabs (Karai/Guardados como estado vacío por ahora). **M**
1b. Migraciones `fix-v2-feed.sql`, `fix-v2-engagement.sql`, `fix-v2-external-events.sql`, `fix-v2-profile.sql` + cron de eventos + RPC `get_feed` (ranking por reglas, reglas de mezcla, cursor) + tests del ranking. **L**
1c. `FeedPager` + `FeedItem` (noticia, video, evento, curso, producto, servicio, empleo, remate) + `ContentCTA` + `ActionRail` persistido + `MarketFeedCard` + telemetría en lotes. **L**
1d. `DetailSheet` (sin publicidad dentro todavía) + recordatorios persistidos. **M**
1e. Explorar (búsqueda, rubros, categorías, tendencias por tags) + Guardados (3 pestañas) + Perfil v2 sin puntos + hoja "Más" + hidratación completa del perfil. **L**

✔ Criterios: 60 fps en un Android de gama medio real · cada item mide exactamente una pantalla · me gusta, guardar, seguir y recordatorio sobreviven a reinstalar la app · `npm run tsc` limpio en `mobile/` y `web/` · tests nuevos en verde · con el flag apagado la v1 queda igual que en el tag `v1-diseno-final`.

### Fase 2 — Onboarding v2 + encuestas + quiz + puntos · **L**
✔ El quiz nunca manda `correct_option` antes de responder (verificable en la red) · responder dos veces no suma puntos dos veces (test de la RPC) · onboarding ≤ 60 s · el primer feed usa las respuestas del onboarding.
Bloqueada en parte por **D3** (vencimiento/tope) y por el valor de bienvenida.

### Fase 3 — Karai en mobile · **M**
✔ Chat con "escribiendo…" en iOS y Android · las refs abren la ficha correcta · la cuota se respeta y se muestra · tests del orquestador con `refs`. Sin cambiar de proveedor (**D5**).

### Fase 4 — En vivo + publicidad · **L**
✔ El aviso EN VIVO completo (desplegar, ver, "No me interesa", X, "Mostrar en Inicio") · 1 patrocinado cada 6–8 orgánicos y nunca en las posiciones 1–2 · "PATROCINADO" siempre visible · reporte por campaña en `/admin` · lead de pauta que llega a `service_leads`.

### Fase 5 — Canjes + perfil público · **L**
✔ Canje transaccional (sin saldo negativo ni stock negativo bajo concurrencia, con test) · código `AGRO-XXXX` único · el admin marca "usado" · `/u/[slug]` con Open Graph. **No se lanza sin premios reales (D4).** D7 define la visibilidad.

### Fase 6 — Android Material You + lanzamiento · **M**
✔ Variante Android según `Android.dc.html` · targets ≥ 44 px, etiquetas de accesibilidad, contraste AA · estados vacíos y de error en todas las pantallas · vistas de métricas · build EAS de prueba.

**Orden sugerido:** F1 → F2 → F3 → F4 → F5 → F6. F3 (Karai) se puede adelantar a F2 si D3 tarda.

---

## 7. Decisiones pendientes (README §7 + las de la auditoría)

| # | Decisión | Bloquea | Mientras tanto |
|---|---|---|---|
| D1 | Precios | — | ✅ **Resuelto:** tarjeta en el feed + acceso fijo "Precios" arriba de todo en Explorar. |
| D2 | Tipografía | — | ✅ **Resuelto:** Figtree en toda la app mobile (hecho en 1a, incluye las pantallas v1). |
| D3 | Puntos: ¿vencen? ¿Tope diario? Valor de bienvenida (+50?) | F2 | Se implementa con tope y vencimiento configurables (null = sin tope ni vencimiento). |
| D4 | Aliados que confirman premios reales | Lanzamiento de F5 | Se puede construir, pero no se lanza. |
| D5 | ¿Sumar Claude como segundo proveedor de Karai? | Nada (F3 anda con OpenAI) | Queda como propuesta aparte, no entra en este plan. |
| D6 | Regla de carga de fotos (1080×1920 o punto focal) | F4/F6 (admin) | Fallback con imagen desenfocada (H3). |
| D7 | Perfil público: ¿lo ve cualquiera o solo usuarios registrados? | F5 | — |
| D8 | Copia de eventos | — | ✅ **Ya no hace falta** (ver H1). |
| D9 | Android de referencia | — | ✅ **Resuelto:** Xiaomi Redmi Note. |
| D10 | **Nuevo:** `main` tiene 1 commit sin push (`bccc015`, arreglo de Sign in with Apple). ¿Lo pusheás vos cuando corresponda? | Nada | No toco remotos. |

---

## 8. Qué necesito de vos para arrancar la Fase 1

1. OK a este plan (o los cambios que quieras).
2. D2 (tipografía) y D8 (espejo de eventos): son las dos que frenan el primer bloque.
3. D1 y D9 cuando puedas. El resto puede esperar a la fase que le corresponde.
