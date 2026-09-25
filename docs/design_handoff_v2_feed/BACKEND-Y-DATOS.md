# Agroconecta v2 — Backend, datos, algoritmo e IA

> Complemento de `README.md`. Son propuestas de diseño técnico: Claude Code las tiene que **validar
> contra el schema real** (`supabase/schema.sql` + todos los `fix-*.sql`) antes de escribir migraciones.
> Convención del repo: cada cambio va en un `supabase/fix-<tema>.sql` nuevo, idempotente
> (`if not exists`), con RLS. **Nunca se corre contra producción sin confirmación de Marce.**

## 1. Principio rector

La app **no decide nada que tenga valor**. Puntos, canjes, respuestas correctas del quiz, orden del
feed y conteo de impresiones de publicidad **se resuelven en el servidor** (RPC `security definer` en
Postgres o rutas en `web/app/api/`). El cliente solo muestra y envía eventos. Si no, los puntos se
inflan y los reportes a anunciantes no valen nada.

## 2. Contenido unificado del feed

Hoy el contenido está repartido: `posts` (artículos, videos, remates, avisos), eventos (tablas de
eventos + `event_schedule_items` + `event_media`), `ecosystem_listings` (empleos, clasificados,
cursos), `library_items`, `ad_campaigns`, `market_prices`.

**Propuesta**: no migrar todo a una sola tabla. Crear una **vista o RPC `feed_candidates`** que
normalice todas las fuentes a una sola forma:

```
feed_item {
  id, source ('post'|'event'|'listing'|'poll'|'quiz'|'ad'|'market_card'),
  source_id, content_type (noticia|video|evento|encuesta|quiz|curso|producto|servicio|empleo|remate|patrocinado),
  organization_id, title, summary, media_url, media_kind ('image'|'video'|'youtube'),
  media_focal_point, tags text[], rubro, target_departments text[],
  published_at, starts_at, is_live, is_sponsored, campaign_id,
  base_engagement (likes, saves, completions)
}
```

Tablas nuevas probables:

| Tabla | Para qué |
|---|---|
| `polls`, `poll_options`, `poll_votes` (unique user+poll) | Encuestas. El voto otorga puntos por RPC. |
| `quizzes`, `quiz_questions` (`correct_option` **nunca se expone por RLS**), `quiz_answers` (unique user+question) | Quiz. La RPC `answer_quiz_question` devuelve si fue correcta y otorga los puntos. |
| `content_likes`, `content_saves`, `follows` (user → organization) | Si no existen ya con otro nombre (`user_subscriptions` podría ser "follows" → **verificar**). |
| `reminders` (user, source, source_id, remind_at, enabled) | Guardados → Recordatorios + push (`push_tokens` ya existe). |
| `feed_events` | Telemetría para el algoritmo (sección 3). |
| `points_ledger` | Movimientos de puntos, solo se agregan filas (sección 5). |
| `rewards`, `reward_redemptions` | Catálogo de premios y canjes. |
| `live_sessions` o columnas `is_live`/`stream_url`/`live_started_at` en eventos | Aviso EN VIVO. |
| `user_dismissals` (user, kind, ref_id) | "No me interesa" en el aviso en vivo, en publicidad, etc. |
| `ad_events` (impression, click, why_opened, dismiss) | Reportes a anunciantes. |

**Medios**: el feed a pantalla completa necesita imágenes verticales. Agregar a `posts`/eventos
`media_focal_point` (x,y 0–1) o `image_url_vertical`. En el admin web: recorte guiado 9:16 y aviso
si la imagen mide menos de 1080 px de ancho. Servir variantes con transformaciones de Supabase Storage.

## 3. Algoritmo del feed (v1 por reglas → v2 aprendido)

### 3.1 Señales que se registran (`feed_events`)

`impression` (item visible ≥ 600 ms) · `dwell_ms` (tiempo en pantalla) · `skip_fast` (< 1.2 s) ·
`like` · `save` · `share` · `cta_open` · `follow` · `poll_vote` · `quiz_answer` · `video_complete` ·
`live_open` · `dismiss`. Se mandan en lotes (cada 10 eventos o cada 15 s), no uno por uno.

### 3.2 Ranking v1 (explicable y ajustable desde el admin)

Para cada candidato:

```
score = w_rec  * decay(horas_desde_publicación, vida_media_por_tipo)
      + w_int  * match(rubros e intereses del usuario, tags/rubro del item)
      + w_geo  * match(departamento del usuario, target_departments)
      + w_prof * match(profesión, afinidad del tipo de contenido)
      + w_fol  * sigue_a_la_organización
      + w_eng  * engagement_normalizado (like+save+cta / impresiones, suavizado bayesiano)
      + w_evt  * cercanía_del_evento (sube 72 h antes, máximo el día anterior)
      - w_seen * ya_visto (fuerte si fue skip_fast)
```

Vida media sugerida: noticia 36 h · video 7 d · evento hasta su fecha · curso/producto/empleo 14 d.

### 3.3 Reglas de mezcla (después de ordenar)

- Nunca 2 items seguidos del mismo tipo ni de la misma organización.
- Máximo 1 encuesta/quiz cada 8 items.
- 1 **patrocinado cada 6–8 orgánicos** (y ninguno en las 2 primeras posiciones).
- 1 tarjeta "Tu mercado hoy" (precios) al principio de la sesión (posición 2–3).
- Siempre ~20 % de exploración (contenido fuera de los intereses declarados) para no encerrar al usuario.
- Arranque en frío (usuario nuevo): se usan solo las respuestas del onboarding + popularidad por departamento.

### 3.4 Implementación

RPC en Postgres `get_feed(p_cursor, p_limit)` (usa `auth.uid()`), con los pesos en una tabla
`feed_weights` editable desde `/admin`. Paginación por cursor, sin offset. Precargar la página siguiente
cuando faltan 3 items. **v2 (más adelante)**: aprender los pesos por segmento a partir de `feed_events`; no hace falta ML en la Fase 1.

## 4. Karai (IA) — reutilizar lo que ya existe

Ya hay una implementación web de Karai en el repo: `web/app/karai/`, `web/app/api/karai/{chat,conversations,quota,notify-interest}`,
`web/lib/karai/` (orquestador, clasificador por reglas, contexto de eventos, extracción de datos del campo, cuota)
y tablas `conversations`, `conversation_messages`, `usage_ledger`, `consents`, `farm_profile`,
`karai_knowledge_sources`, `karai_leads`. El proveedor está desacoplado en `web/lib/karai/ai-provider.ts`
(interfaz `AIProvider`, hoy `OpenAIProvider` con el modelo `gpt-5.6-luna` vía `/v1/responses`).

**Qué hay que hacer para la v2 mobile:**

1. **La tab KARAI de mobile consume la misma API** (`/api/karai/chat`) autenticando con el JWT de Supabase. No se crea un segundo backend de IA.
2. **Streaming en React Native**: validar si `expo/fetch` soporta la lectura del stream en el SDK 55. Si no, usar SSE (`react-native-sse`) o respuesta completa con indicador de "escribiendo".
3. **Referencias a contenido**: el orquestador tiene que poder devolver, además del texto, una lista `refs: [{type, id}]` (noticias, eventos, cursos, remates, precios) que la app muestra como tarjetas que se pueden abrir. Se implementa como herramienta o paso de búsqueda sobre `feed_candidates`/`posts` (texto completo en español con `unaccent`, y más adelante embeddings).
4. **Cuota y costos**: respetar `usage_ledger` y `quota` existentes. Mostrar el límite amablemente en la app.
5. **Proveedor**: **no cambiarlo en este proyecto.** Si Marce decide sumar Claude, se agrega un `AnthropicProvider` que implemente la misma interfaz, seleccionable por variable de entorno, con pruebas del orquestador. La API key nunca va en la app mobile.
6. **KARAI Campo**: por ahora es la pantalla/landing de interés (reusar `notify-interest`).

## 5. Puntos y canjes

- `points_ledger(id, user_id, delta int, source text, source_ref text, created_at)` con **unique (user_id, source, source_ref)**: así la misma encuesta o pregunta no puede dar puntos dos veces.
- Saldo = `sum(delta)` (vista `points_balance` o columna cacheada que actualiza un trigger).
- Reglas iniciales (aprobadas): encuesta **+10** · acierto de quiz **+10** por pregunta · bienvenida (a definir; en el prototipo arranca con 120 pts solo para demo).
- `rewards(id, kind ('curso'|'evento'|'charla'), title, partner_org_id, cost, stock, valid_until, is_active)`.
- `reward_redemptions(id, user_id, reward_id, code unique, status ('emitido'|'usado'|'vencido'|'anulado'), created_at, used_at)`. El canje es una RPC transaccional: valida saldo y stock, descuenta, genera el código y lo registra en el ledger con delta negativo.
- Admin web: gestionar premios y marcar un código como usado (lo usa el aliado u organizador).
- Antifraude mínimo: puntos solo para usuarios con email verificado, tope diario configurable, y el ledger auditable.
- **Pendiente de Marce**: vencimiento de puntos y tope diario.

## 6. Publicidad

- Reutilizar `ad_campaigns` (ya segmenta por profesión, departamento y categoría y tiene placements, ver `fix-ad-campaigns-placement.sql`). Agregar placements **`feed`** (item a pantalla completa) y **`article_inline`** (bloque dentro de la noticia).
- **Contenido pautado**: un post de una organización se puede promocionar → `posts.is_sponsored`, `campaign_id`. Se muestra siempre con la etiqueta "PATROCINADO" (obligatoria, no configurable).
- `ad_events` alimenta un reporte por campaña (impresiones, clics, CTR, alcance por departamento) en `/admin`. Es lo que se le vende al anunciante.
- "¿Querés pautar tu contenido acá?" → formulario de lead reutilizando `service_leads` / `/api/service-lead`.

## 7. En vivo

- Un evento o remate queda "en vivo" cuando `is_live = true` (lo activa el admin o una ventana horaria automática), con `stream_url` (YouTube Live, reproductor `react-native-youtube-iframe` que ya se usa).
- La app consulta los en vivo activos al abrir y cada 60 s (o Supabase Realtime). Muestra el aviso si hay uno y el usuario no lo descartó (`user_dismissals`).
- "No me interesa" / X → dismissal del evento. Sigue visible en Explorar. "Mostrar en Inicio" borra el dismissal.
- Push opcional "Empezó el remate que seguís" a los que tengan recordatorio activo.

## 8. Perfil público

- Ampliar `profiles` (o crear `profile_cv`) con: slug, cargo, organización actual, formación, experiencia (jsonb o tabla), especialidades, redes, visibilidad.
- Página pública en web: `web/app/[slug]` o `web/app/u/[slug]` (SSR + Open Graph) → "Compartir perfil" comparte ese link.

## 9. Métricas de éxito (instrumentar desde la Fase 1)

Retención D1/D7/D30 · items vistos por sesión · % de sesiones con al menos una interacción · participación en encuestas/quiz ·
CTR del botón de acción por tipo · CTR de publicidad · puntos emitidos vs. canjeados · mensajes a Karai por usuario activo.
