# Prompt para Claude Code — Agroconecta v2 (feed vertical)

Copiá todo lo que está debajo de la línea y pegalo en Claude Code, abierto en la raíz del repo
(`AGROCONECTA APP`). Antes, guardá el HTML descargado del prototipo en
`docs/design_handoff_v2_feed/prototype/agroconecta-v2-prototipo.html`.

---

Vamos a empezar el rediseño **Agroconecta v2**: la app mobile pasa a tener un feed vertical a
pantalla completa (un contenido por pantalla, se desliza hacia arriba), una barra de 5 tabs (Inicio, Explorar,
KARAI, Guardados, Perfil), encuestas y quiz con puntos que se pueden canjear, aviso de eventos EN VIVO,
publicidad en el feed y dentro de las noticias, y el perfil tipo CV profesional. El objetivo es hacer
la mejor app agro de la región, así que priorizamos calidad, rendimiento y datos confiables sobre velocidad.

## 0. Contexto obligatorio (leelo antes de hacer nada)

1. `CLAUDE.md` y `AGENTS.md` (reglas del repo: TypeScript estricto sin `any`, UI en español con voseo, constantes sin hardcodear, componentes de menos de ~150 líneas, migraciones como `supabase/fix-*.sql`).
2. Todo `docs/design_handoff_v2_feed/`:
   - `README.md` → pantallas, componentes, tokens, interacciones y decisiones pendientes.
   - `BACKEND-Y-DATOS.md` → modelo de datos, algoritmo del feed, Karai, puntos, publicidad, en vivo.
   - `ONBOARDING-V2.md` → nuevo onboarding.
   - `prototype/agroconecta-v2-prototipo.html` (abrilo para ver cómo se siente) y `prototype/source/*.dc.html` (valores exactos de tamaños, colores y la lógica de cada interacción).
3. Lo que ya existe y hay que **reutilizar, no reescribir**: Karai web (`web/app/karai`, `web/app/api/karai/*`, `web/lib/karai/*`, adaptador `AIProvider`), `ad_campaigns` con placements, eventos + hub `event/[slug]`, `ecosystem_listings`, biblioteca, `push_tokens` + `notification_prefs`, `resolveProfileForCurrentSession()`.

## 1. Git: guardar el diseño actual y abrir la rama (hacelo primero, mostrame cada comando)

1. `git status` y `git branch -a`. Hoy el repo puede estar en la rama `codex/reestructura-20260924-103311`: verificá si tiene commits o cambios que no estén en `main` (`git log main..HEAD`, `git diff main --stat`). **Si los tiene, frená y preguntame** qué hacer con esa rama antes de seguir. No borres ni reescribas ninguna rama.
2. Si hay cambios sin commitear que no son tuyos, preguntame antes de commitearlos o guardarlos con stash.
3. Pasá a `main` actualizada (`git fetch` + `git pull --ff-only`).
4. **Congelá el diseño actual** con un tag anotado sobre `main`:
   `git tag -a v1-diseno-final -m "Diseño v1 antes del rediseño v2 (feed vertical)"`.
5. Creá la rama de trabajo: `git checkout -b feature/v2-feed-redesign`.
6. Commiteá el paquete de handoff (`docs/design_handoff_v2_feed/`) como primer commit de la rama.
7. **No hagas push ni publiques tags sin preguntarme.**

La v1.0.0 está en revisión en las stores y la v1.1.0 sigue en `main`. Todo el trabajo v2 vive en esta
rama, y la home nueva queda detrás de un flag (`EXPO_PUBLIC_FEED_V2`), así podemos seguir sacando
arreglos de v1 desde `main` sin mezclar.

## 2. Primer entregable: plan de implementación (sin tocar código todavía)

Auditá el código real contra el handoff y escribí `docs/design_handoff_v2_feed/PLAN-IMPLEMENTACION.md` con:

- **Mapa de rutas actual → v2** (qué pantalla de `mobile/app` se reutiliza, cuál se reemplaza, cuál se mueve y cuál se retira). Nada de la v1 se pierde sin una decisión mía explícita.
- **Qué hay que AGREGAR / CAMBIAR / ELIMINAR / REUTILIZAR**, por área: navegación, feed, detalle, Explorar, Karai, Guardados, Perfil, Canjes, onboarding, tipografía, backend (tablas, RPC, RLS), admin web, push, analítica.
- **Brechas de schema**: compará las tablas propuestas en `BACKEND-Y-DATOS.md` con `supabase/schema.sql` + todos los `fix-*.sql`. Decime qué ya existe con otro nombre (por ejemplo, si `user_subscriptions` ya cumple el rol de "follows").
- **Dependencias nuevas** (por ejemplo `expo-blur`, `react-native-pager-view`, `expo-video`, `@expo-google-fonts/figtree`), justificando cada una y verificando que sean compatibles con Expo SDK 55.
- **Riesgos** (rendimiento del feed en Android de gama media, imágenes horizontales en un feed vertical, streaming de Karai en RN, costos de IA, antifraude de puntos) y cómo mitigarlos.
- **Fases con criterios de aceptación** (usá las de abajo como base) y una estimación relativa.
- La lista de **decisiones pendientes** (README sección 7), marcando cuáles bloquean cada fase.

**Mostrámelo y esperá mi aprobación antes de escribir código.**

## 3. Fases (una PR o bloque de commits por fase, cada una deja la app compilando)

**Fase 1 — Base de navegación + feed (lo que más cambia la experiencia)**
Tokens v2 en `constants/` (namespace nuevo, sin romper `Colors.redesign`), `GlassSurface`, `FloatingTabBar` con las 5 tabs,
`FeedPager` + `FeedItem` para noticia, video, evento, curso, producto, servicio, empleo y remate con datos reales,
`ActionRail` (me gusta, guardar, compartir y seguir, persistidos en Supabase), `ContentCTA` estandarizado, `DetailSheet`,
Explorar (búsqueda, rubros, categorías, tendencias), Guardados (las 3 pestañas), Perfil v2 (sin puntos todavía),
ranking v1 por reglas (RPC `get_feed` + `feed_events`) e hidratación remota del perfil.
✔ Criterio: el feed anda fluido a 60 fps en un Android de gama media, cada item mide exactamente una pantalla, `npm run tsc` pasa sin errores, y el flag permite volver a la home v1.

**Fase 2 — Onboarding v2 + encuestas + quiz + puntos**
`ONBOARDING-V2.md`, `PollCard`, `QuizCard` (tarjeta blanca centrada), `points_ledger` con RPC idempotentes, píldora de puntos
(solo el número) y tarjeta de puntos en Perfil. La respuesta correcta del quiz nunca viaja al cliente antes de que el usuario responda.

**Fase 3 — Karai en mobile**
La tab KARAI consume `/api/karai/chat` con el JWT de Supabase, con sugerencias, "escribiendo…", tarjetas `refs` que se pueden abrir
(hay que extender el orquestador), cuota, y la tarjeta KARAI Campo. **No cambies el proveedor de IA**: si ves motivos para sumar Claude
como segundo proveedor detrás de `AIProvider`, proponelo y lo decido yo.

**Fase 4 — En vivo + publicidad**
`LiveBanner` (plegado/desplegado, "Ver en vivo", "No me interesa", X) + fila en Explorar con "Mostrar en Inicio", `user_dismissals`,
placements `feed` y `article_inline` en `ad_campaigns`, posts patrocinados siempre etiquetados "PATROCINADO", `ad_events` y reporte
por campaña en `/admin`, y el lead "¿Querés pautar tu contenido acá?".

**Fase 5 — Canjes + perfil público**
`rewards` / `reward_redemptions` con RPC transaccional, pantalla Canjear (saldo, progreso, catálogo, mis canjes con código, historial),
admin de premios con validación de códigos, y perfil público en web (`/u/[slug]` con Open Graph) para "Compartir perfil".
**Esta fase no se lanza sin premios reales confirmados por aliados.**

**Fase 6 — Pulido Android (Material You) y lanzamiento**
Variante Android según `prototype/source/Android.dc.html`, accesibilidad (etiquetas, contraste, targets de 44 px o más), estados vacíos y de error,
analítica de métricas de éxito (`BACKEND-Y-DATOS.md` sección 9), build EAS de prueba.

## 4. Reglas de trabajo

- **Datos confiables primero**: puntos, canjes, respuestas del quiz, orden del feed e impresiones de publicidad se deciden en el servidor.
- Migraciones: archivos `supabase/fix-v2-*.sql` idempotentes, con RLS. **No las ejecutes en producción**; dame el orden para correrlas.
- Nada de datos de prueba en código de producción (`mock-data.ts` sigue siendo solo fallback de desarrollo).
- Pruebas: extendé la suite existente (hay tests de Karai) con el ranking del feed, las RPC de puntos y canjes, y el mapeo de tipos de contenido a texto del botón de acción.
- Al terminar cada fase: `npm run tsc` en `mobile/` y `web/`, resumen corto de lo hecho y lo pendiente, y actualizá `CLAUDE.md` (sección de estado + entrada fechada en el changelog de arriba).
- Si algo del handoff choca con el código real o con una buena práctica, **decímelo y proponé una alternativa**; no lo implementes al pie de la letra si está mal.
- Cuando te falte una decisión mía, seguí con lo que no depende de ella y dejá la pregunta anotada en el plan.

Arrancá por el punto 1 (Git) y después el punto 2 (plan). No escribas código de la app hasta que apruebe el plan.
