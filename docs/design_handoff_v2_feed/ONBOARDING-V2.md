# Agroconecta v2 — Onboarding

> Objetivo: en **≤ 60 segundos** saber lo suficiente para que el **primer feed ya sea relevante**
> (el algoritmo no tiene historial todavía). Todo lo que no sea imprescindible se pregunta después,
> dentro del feed, como encuesta de perfil que también da puntos.

## Estado actual (v1)

`mobile/app/(onboarding)/index.tsx` tiene 6 pasos: nombre → WhatsApp → profesión → departamento →
preferencias de noticias → medios a los que suscribirse. Persiste en AsyncStorage y sincroniza
best-effort `profiles`, `user_interests` y `user_subscriptions`. `resolveProfileForCurrentSession()`
evita heredar el perfil de otra cuenta: **eso no se toca.**

## Flujo propuesto (v2)

| # | Paso | Obligatorio | Alimenta |
|---|---|---|---|
| 0 | Bienvenida visual (3 slides máximo: feed, Karai, puntos) + login (Google / código por email / email+contraseña, **igual que hoy**) | — | — |
| 1 | Nombre | Sí | Perfil |
| 2 | **Rubros** (multi): Agricultura, Ganadería, Horticultura, Tecnología, Mercados | Sí (≥ 1) | Algoritmo (`w_int`) |
| 3 | **Qué producís o te interesa** (multi, según rubro): soja, maíz, trigo, arroz, sésamo, chía, girasol / cría, invernada, feedlot, tambo, porcino, avícola / hortalizas, frutas, invernadero… | Opcional | Algoritmo, Karai |
| 4 | Profesión o rol (slugs actuales) + **escala** opcional (productor chico / mediano / grande, técnico, empresa, estudiante) | Sí (profesión) | `w_prof`, segmentación de publicidad |
| 5 | Departamento (slugs actuales) | Sí | `w_geo`, eventos cercanos |
| 6 | **Para qué usás Agroconecta** (multi): informarme, precios, capacitarme, comprar/vender, buscar empleo, eventos y remates | Sí (≥ 1) | Mezcla del feed por tipo |
| 7 | **Seguí al menos 3 organizaciones o medios** (sugeridas por rubro y departamento; reemplaza "medios") | Recomendado | `w_fol`, arranque en frío |
| 8 | Notificaciones: pedir el permiso **con contexto** ("Te avisamos cuando empieza un remate que seguís") + categorías (`notification_prefs` ya existe) | Opcional | Push |
| 9 | WhatsApp (opcional, explicando para qué: alertas y Karai por WhatsApp más adelante) | Opcional | Karai/WasAgro |
| — | Aceptación de términos y del programa de puntos (tabla `consents` ya existe) | Sí | Legal |

Reglas de UX:

- Un solo concepto por pantalla, botones grandes con chips, barra de progreso arriba, "Saltar" en los opcionales.
- Tono en español paraguayo (voseo), igual que el resto de la app.
- Al terminar: transición directa al feed con un primer item de bienvenida ("Deslizá hacia arriba") y **+50 pts de bienvenida** (valor a confirmar con Marce).

## Perfil progresivo (después del onboarding)

- Encuestas de perfil dentro del feed (máximo 1 por semana): "¿Cuántas hectáreas trabajás?", "¿Qué maquinaria usás?". Dan puntos y completan el perfil.
- Completar el perfil CV (formación, experiencia) → +puntos, y habilita el link público.
- Un usuario sin AsyncStorage local (reinstalación u otro dispositivo) tiene que **recuperar su perfil desde Supabase** (hoy está pendiente la hidratación remota completa) → **es requisito de la Fase 1**.

## Datos nuevos a guardar

`user_interests` (rubros, cultivos, especies, objetivos) — validar si alcanza con el schema actual o
conviene una tabla `user_profile_facets(user_id, facet, value)`. La escala y los objetivos van a
`profiles` o a facets. Todo con RLS de dueño.
