# Agroconecta v2 — Handoff de diseño: feed vertical

> Versión del documento: 1.0 · 2026-09-25 · Autor del prototipo: Marce + Claude (Cowork)
> Estado: **diseño aprobado para implementar** (el contenido de ejemplo se pule después).
> Alcance: `mobile/` (app Expo). `web/` se toca solo donde el backend lo exige (APIs, admin, perfil público).

Este paquete describe **qué hay que construir**, no cómo está hecho el prototipo. El prototipo es la
referencia de *cómo se siente* la app; los números exactos (tamaños, radios, colores) están en
`prototype/source/Main.dc.html` y en la sección 4 de este documento.

## Contenido del paquete

| Archivo | Para qué sirve |
|---|---|
| `README.md` | Este documento: concepto, arquitectura de pantallas, componentes, tokens, interacciones. |
| `BACKEND-Y-DATOS.md` | Modelo de datos en Supabase, algoritmo del feed, Karai, puntos/canjes, publicidad, en vivo. |
| `ONBOARDING-V2.md` | Qué hay que preguntar al usuario nuevo y por qué (alimenta el algoritmo). |
| `PROMPT-CLAUDE-CODE.md` | El prompt para arrancar la implementación en Claude Code. |
| `prototype/` | El HTML del prototipo (lo descarga Marce) + el código fuente de cada pantalla (`source/`). |

---

## 1. Concepto

Agroconecta pasa de ser "un portal de noticias en el celular" a ser **el feed del agro paraguayo**:
un contenido por pantalla, a pantalla completa, y se desliza hacia arriba para ver el siguiente (la
misma mecánica de los videos cortos, adaptada al agro; no se copia la estética de ninguna app).

Principios que no se negocian:

1. **Un contenido por pantalla.** Nada de grillas en Inicio.
2. **La foto o el video es lo principal.** La información y las acciones van encima, con un degradado oscuro abajo.
3. **Muy pocos elementos fijos**: la barra de navegación flotante y la barra lateral de acciones.
4. **Se entiende en menos de 5 segundos.** Si algo requiere explicación, está mal diseñado.
5. **Todo tipo de contenido convive en el mismo feed**: noticia, video, evento, encuesta, quiz, curso, producto, servicio, empleo, remate y patrocinado.

## 2. Arquitectura de navegación

Barra inferior **flotante** con exactamente 5 destinos:

| # | Tab | Contenido |
|---|---|---|
| 1 | **Inicio** | Feed vertical a pantalla completa (sección 3.1). |
| 2 | **Explorar** | Buscador, filtros por rubro, categorías por tipo de contenido, tendencias, aviso de eventos en vivo. |
| 3 | **KARAI** (central, destacado) | Asistente con IA. Botón circular verde que sobresale de la barra. |
| 4 | **Guardados** | Pestañas: Guardados · Recordatorios · Actividad. |
| 5 | **Perfil** | Perfil tipo CV profesional + puntos + acceso a Canjes. |

### Dónde quedan las funciones actuales (no se pierde nada)

La v1 tiene funciones que no aparecen como tab en el prototipo. **No se eliminan**, se reubican:

| Función v1 | Dónde vive en v2 |
|---|---|
| Precios (ganado + commodities) | Tarjeta "Tu mercado hoy" dentro del feed (1 cada N items) + bloque en Explorar + Karai responde precios. **Decisión pendiente, ver sección 7.** |
| Noticias (listado) | Explorar → Noticias. |
| Videos / Remates | En el feed + Explorar → Videos / Remates. |
| Eventos + hub de evento (`event/[slug]`) | Feed + Explorar → Eventos + aviso EN VIVO. El hub existente se reutiliza como la vista "Ver evento". |
| Ecosistema (Empleos, Clasificados, Cursos, Remates Online) | Explorar → categorías Empleos / Productos / Servicios / Cursos. `ecosystem_listings` se reutiliza. |
| Biblioteca | Explorar (categoría o bloque) y Guardados. |
| Aliados, Contacto, Nosotros, Sumate, Publicar | Perfil → menú secundario (hoja inferior o pantalla "Más"). |

## 3. Pantallas

### 3.1 Inicio — feed vertical

- **Paginación vertical con enganche**: cada item mide exactamente la altura de la pantalla. En React Native: `FlatList` con `pagingEnabled` + `snapToInterval`, o `react-native-pager-view` en vertical. Tiene que andar a 60 fps en un Android de gama media: esa es la condición para darlo por bueno.
- **Fondo**: foto o video a pantalla completa (`expo-image` con `contentFit="cover"`; video con autoplay silenciado y pausa cuando sale de pantalla).
- **Degradado**: arriba 0→16 % (oscuro suave para el logo), abajo 44 %→100 % hasta casi negro. Valores exactos en `.shade` del prototipo.
- **Cabecera** (dentro de cada item): wordmark `agroconecta` a la izquierda, y a la derecha la píldora de **puntos (solo el número: "120 pts")** + botón Buscar. Todo en vidrio.
- **Barra lateral derecha** (de arriba hacia abajo): avatar de la organización con botón "+" para seguir (cambia a ✓), Me gusta con contador, Guardar ("Guardar" / "Guardado"), Compartir. **Sin comentarios.**
- **Zona inferior izquierda**: chip del tipo ("NOTICIA", "EVENTO"…) + nombre de la organización, título (26/1.14, 800), descripción corta, etiquetas.
- **Botón de acción estandarizado** (`ContentCTA`): **misma posición, tamaño y estilo siempre**; solo cambia el texto según el tipo:

  | Tipo | Texto |
  |---|---|
  | noticia | Ver noticia |
  | video | Ver video |
  | evento | Ver evento |
  | producto | Ver producto |
  | curso | Ver curso |
  | servicio | Ver servicio |
  | empleo | Ver oportunidad |
  | remate | Ver remate |
  | patrocinado | Ver promoción (o el texto que cargue el anunciante, máx. 18 caracteres) |

- **Encuesta y quiz**: tarjeta **blanca, centrada**, sin barra lateral ni botón de acción. Se responden directamente en el feed. Se muestra cuántos puntos da ("+10 pts") y, después de responder, "+10 pts ganados".
  - Encuesta: al votar se ven los porcentajes con una barra verde animada.
  - Quiz: 3 preguntas con barra de progreso. Al responder se marca "Correcta" / "Tu respuesta" y aparece "Siguiente pregunta". Al final se muestra el resultado y el botón "Ver qué puedo canjear".
- **Video**: botón play/pausa en vidrio al centro (invisible mientras reproduce) + barra de progreso fina arriba del botón de acción.
- **Aviso EN VIVO** (fijo sobre el feed, debajo de la cabecera):
  - Plegado: chip rojo "EN VIVO" con punto que late + título + flecha para desplegar + **X para cerrarlo**.
  - Desplegado: miniatura, título, dato en vivo (por ejemplo "Lote 12/40 · 1.284 conectados") y dos botones: **"Ver en vivo"** y **"No me interesa"**.
  - Si el usuario lo cierra, desaparece de Inicio, pero **sigue en Explorar** como una fila discreta con "Ver" y "Mostrar en Inicio".
- **Patrocinado en el feed**: es un item más, igual que los demás, pero con el chip **blanco "PATROCINADO" y punto ámbar** (se distingue siempre del contenido orgánico) + el link "¿Querés pautar tu contenido acá?".

### 3.2 Ficha de detalle ("Ver …")

Hoja inferior a casi toda la pantalla (se ve el feed atrás), con: imagen de cabecera, tipo, título,
organización con Seguir, dato de fecha y lugar (eventos y remates), cuerpo, y un botón principal según el tipo:

- evento / remate → **Activar recordatorio** (se refleja en Guardados → Recordatorios)
- en vivo → **Ver transmisión en vivo** (rojo)
- resto → **Guardar**
- \+ Compartir

**Publicidad dentro de la noticia**: bloque "PATROCINADO" **entre el primer y el segundo párrafo**,
con "¿Por qué lo veo?", miniatura, anunciante, título, bajada y el botón "Conocer más".

### 3.3 Explorar

Título, buscador grande ("Buscar en Agroconecta"), filtros por rubro (Agricultura, Ganadería,
Horticultura, Tecnología, Mercados), fila discreta **EN VIVO AHORA**, grilla de 8 categorías
(Noticias, Eventos, Videos, Cursos, Productos, Servicios, Empleos, Remates) y Tendencias (top 4
hashtags). Al buscar, filtrar o tocar una categoría se ve una lista de resultados (miniatura + tipo + título + organización).

### 3.4 KARAI

Pantalla clara. Encabezado "Karai" + "¿Qué necesitás saber del agro?", 4 sugerencias, tarjeta
**KARAI Campo** ("Administrá tu establecimiento con ayuda de inteligencia artificial" → "Conocer KARAI Campo").
El chat muestra el indicador de "escribiendo" y **tarjetas de contenido de Agroconecta que se pueden abrir** dentro de
las respuestas (esto es clave: Karai es otra forma de navegar el contenido, no un chat suelto). Detalle técnico en `BACKEND-Y-DATOS.md`.

### 3.5 Guardados

Control segmentado: **Guardados** (lo marcado desde el feed, o un estado vacío que explica cómo guardar) ·
**Recordatorios** (tarjeta con fecha + switch; "Te avisamos 1 hora antes") · **Actividad** (contenido visto,
encuestas respondidas, productos consultados, eventos visitados).

### 3.6 Perfil (CV profesional)

Portada oscura con el arco verde del isologo, avatar, nombre, cargo, formación, país, intereses,
**Compartir perfil** (link público `agroconecta.com.py/<slug>`), editar, **tarjeta de Puntos con
"Canjear"**, y las secciones Sobre mí, Experiencia, Especialidades, Formación, Organizaciones y Redes sociales.

### 3.7 Canjear puntos

Saldo en grande sobre fondo oscuro + barra de progreso hacia el próximo premio, catálogo **Cursos y
eventos** (el botón muestra el costo y "Canjear" / "Faltan X"), **Mis canjes** con un código tipo `AGRO-XXXX`,
**Cómo sumar puntos** e **Historial** (con + y −).

## 4. Tokens de diseño (del prototipo)

| Token | Valor | Uso |
|---|---|---|
| `lime` | `#A4D233` | Botón de acción, KARAI, acentos, barras de encuesta. **Nunca como texto sobre blanco.** |
| `limeText` | `#4E6B12` | Verde para texto sobre fondos claros (contraste AA). |
| `limeTint` | `#EEF4DC` / texto `#3F5A0C` | Chips y etiquetas claras. |
| `navy` | `#0B1620` | Texto principal, botones oscuros, fondo base. |
| `ground` | `#F4F5F0` | Fondo de las pantallas claras. |
| `surface` | `#FFFFFF` | Tarjetas. |
| `muted` | `#5A5F55` | Texto secundario. |
| `live` | `#E5484D` | Solo para EN VIVO. |
| `sponsor` | `#E0A100` | Punto del chip "PATROCINADO". |
| Vidrio sobre foto | `rgba(255,255,255,.16)` + borde `rgba(255,255,255,.24)` + blur 18 | Botones sobre la foto (`expo-blur`, intensidad ~40). |
| Barra de navegación en Inicio | `rgba(14,20,16,.34)` + blur 26 | Sobre la foto. |
| Barra de navegación en pantallas claras | `rgba(255,255,255,.74)` + blur 26 | |

**Radios**: botón de acción 26 (alto 52), botones laterales 24 (48×48), tarjetas 18–20, encuesta/quiz 28, barra de navegación 33 (alto 66, 16 px a los costados, 22 px desde abajo + safe area).

**Tipografía**: Marce aprobó la del prototipo. En Windows se vio **Figtree** (Google Fonts); en iOS
el prototipo cae en SF Pro. **Recomendación: adoptar Figtree en toda la app mobile**
(`@expo-google-fonts/figtree`, pesos 400–800) en lugar de Noto Sans, reusando el mismo mapeo de claves
de `constants/typography.ts`. Confirmar con Marce antes del cambio global (ver sección 7).

Escala: título del feed 26/1.14/800 (tracking −0.02em) · H1 de pantalla 32/1.1/800 · cuerpo 15–16/1.4–1.5 · chip de tipo 11/700 (tracking .09em, mayúsculas) · etiquetas de la barra de navegación 10.

**Tamaños táctiles**: mínimo 44 px. **iOS**: vidrio translúcido, estilo Liquid Glass. **Android**:
Material You. La arquitectura es la misma, cambia la forma: barra de navegación de 80 px con indicador en píldora, botones
tonales de 48 px, chips de radio 8, KARAI como botón cuadrado redondeado de 56×44. Ver `prototype/source/Android.dc.html`.

## 5. Componentes a crear (mobile)

`FeedPager`, `FeedItem` (y una variante por tipo), `FeedBackground` (imagen/video),
`ActionRail`, `FollowAvatar`, `ContentCTA` (**un solo componente**; recibe el tipo y resuelve el texto),
`TypeChip`, `PollCard`, `QuizCard`, `SponsoredBadge`, `LiveBanner` (+ `LiveRow` para Explorar),
`GlassSurface` (encapsula `expo-blur` + el fallback de Android), `FloatingTabBar`, `DetailSheet`,
`InlineAdBlock`, `PointsPill`, `PointsCard`, `RewardCard`, `SegmentedControl`, `ReminderSwitch`,
`KaraiRefCard`. Regla del repo: componentes de menos de ~150 líneas, sin colores ni textos hardcodeados.

## 6. Interacciones que tienen que funcionar

Deslizar entre publicaciones · me gusta · guardar · compartir (hoja nativa `Share`) · seguir y dejar de seguir ·
responder encuesta y quiz (+ puntos) · abrir "Ver …" · activar recordatorio · cambiar entre las 5 pantallas ·
buscar · abrir perfil · compartir perfil · chat con Karai · aviso en vivo (desplegar, ver, cerrar, volver a mostrar) ·
canjear puntos · click en publicidad (se registra).

Feedback: háptico leve (`expo-haptics`) al dar me gusta, guardar, votar y canjear; aviso breve (toast) arriba para confirmar.

## 7. Decisiones pendientes de Marce (bloquean partes específicas, no todo)

1. **Precios**: ¿tarjeta en el feed + Explorar alcanza, o Precios necesita un acceso fijo? (Es una de las funciones de más uso de la v1.)
2. **Tipografía**: ¿Figtree en toda la app mobile?
3. **Puntos**: ¿vencen (por ejemplo a los 12 meses) o se acumulan para siempre? ¿Hay tope diario?
4. **Canjes**: qué aliados confirman premios reales antes de lanzar la Fase 4 (sin premios reales no se lanza).
5. **Proveedor de IA de Karai**: hoy es OpenAI (`gpt-5.6-luna`) detrás del adaptador `AIProvider`. ¿Se mantiene o se suma Claude como segundo proveedor?
6. **Fotos del feed**: la regla de carga (formato vertical mínimo 1080×1920, o recorte inteligente con punto focal).
7. **Perfil público**: ¿lo ve cualquiera con el link, o solo usuarios registrados?
