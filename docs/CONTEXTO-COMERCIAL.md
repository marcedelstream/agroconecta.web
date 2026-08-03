# Agroconecta — Contexto comercial

> Documento pensado para abrir en una sesión nueva enfocada en decisiones de negocio (pricing, prioridades,
> qué vender primero) — no en desarrollo. Para detalle técnico completo ver `CLAUDE.md`; para features
> planificadas en detalle técnico ver `docs/ESTRUCTURA-Y-ROADMAP.md`. Última actualización: 2026-07-21.

## Qué es Agroconecta, en una línea

Ecosistema digital agropecuario para Paraguay: app móvil + web pública, centraliza noticias, precios de
mercado, remates, eventos, biblioteca digital y un directorio de organizaciones ("Aliados") del sector.
Modelo de negocio actual y futuro es fundamentalmente **B2B2C**: el usuario final (productor, veterinario,
agrónomo, etc.) usa la app gratis; el ingreso viene de organizaciones y marcas que quieren llegar a ese
público.

## Qué está construido y funciona hoy

- **App móvil** (React Native/Expo): login con Google o código por email, onboarding con perfil
  (profesión/departamento/intereses), feed de noticias, precios (ganadero + commodities), videos/remates
  con reproductor de YouTube nativo, eventos (listado + hub por evento + recordatorios push), biblioteca
  digital, directorio de Aliados, sección "Descubrir" (ecosistema de plataformas propias), notificaciones
  push funcionales con preferencia real por categoría.
- **Web pública**: home de noticias, precios, ecosistema, quiénes somos — funciona como vidriera SEO del
  contenido que también está en la app.
- **Panel admin (web)**: gestión de publicaciones (con flujo de aprobación editorial), organizaciones,
  precios, banners, eventos, biblioteca, envío de notificaciones push (manual o automático).
- **Deploy**: web en producción en Vercel (`agroconecta.com.py`). App móvil **todavía no tiene su primer
  build de producción/publicación en las stores** — es el paso pendiente más importante antes de tener
  usuarios reales instalando la app fuera de development builds.

## Mecanismos de monetización que YA existen en el producto (no son ideas, es código funcionando)

### 1. Publicidad segmentada — el más cerca de venderse ya
Sistema de banners (`ad_campaigns`) con segmentación real por **profesión, departamento y categoría de
noticia**, con espacios en Home, Videos, Precios y detalle de Artículo. Un anunciante puede pedir "solo
productores ganaderos de Alto Paraná" — algo que Meta/Google no ofrecen con esa precisión para el agro
paraguayo específicamente. Falta la parte comercial (tarifario, contactar anunciantes), no ingeniería.

### 2. Directorio de Aliados — plan B2B ya diseñado en el schema, falta cobrarlo
Dos planes ya modelados: **"Aliado Semilla"** y **"Aliado Cosecha"** (`AllyPlan`), con estado comercial por
organización (`trial | active | overdue | paused`) y notas de facturación (`billingNotes`). Hoy ese estado
se actualiza a mano en el admin — no hay pasarela de pago ni cobro automático. Es el modelo clásico: pagan
por verificación + aparecer en el directorio + publicar contenido + llegar a su segmento con push/banners.

### 3. Leads de servicios propios (consultoría, desarrollo, publicidad, oportunidad comercial)
Formularios dentro de la app (`service_leads`) para: Consultoría Ambiental, Marketing Digital, Consultoría
en Producción Vegetal, Desarrollo Web y Software, Publicidad en la App, Oportunidad Comercial, e interés en
las secciones de "Descubrir". El dato ya se guarda en Supabase — **falta activar el aviso automático por
email** (cuenta de Resend pendiente de configurar), hoy alguien tiene que revisar la tabla a mano.

## Features planificadas explícitamente como premium/vendibles (roadmap, sin construir aún)

Documentadas en detalle técnico en `docs/ESTRUCTURA-Y-ROADMAP.md`:

- **Evento especial estilo OneFootball** (timeline en vivo + alertas push durante un evento) — pensado
  como value-add pago para una organización que quiera cobertura en vivo de su feria/expo/remate. Encaja
  directo con subir a un organizador de "Aliado Semilla" a "Aliado Cosecha".
- **Módulos de "Descubrir"** (Clasificados, Bolsa de Trabajo, Remates Online, Cursos) — hoy son pantallas
  de "Próximamente" con captura de interés. Arquitectura ya planificada para construirlos reusando lo que
  ya existe (moderación, admin, push) en vez de sistemas nuevos por módulo.
- **Scraping de noticias institucionales** (MAG, SENAVE, INFONA) — mantiene la app con contenido fresco
  sin carga editorial manual constante; palanca de retención más que de ingreso directo, pero reduce el
  costo operativo de mantener el feed activo.

## Qué bloquea ingresos hoy (operativo, no técnico)

1. **Resend sin configurar** — los leads de servicios se guardan pero no generan aviso automático por
   email; hoy depende de que alguien revise el panel admin manualmente.
2. **Cobro de planes Aliado 100% manual** — no hay pasarela de pago ni recordatorio automático cuando un
   plan pasa a "vencido".
3. **App móvil sin publicar** — sin build de producción en Play Store/App Store todavía, no hay usuarios
   reales más allá de development builds, lo que limita el argumento de venta ante anunciantes/Aliados
   ("cuántos usuarios activos tenés" es la primera pregunta de cualquier anunciante).

## Decisiones de producto ya tomadas (para no reabrir la conversación sin motivo)

- **Cursos**: en pausa, sin fecha — se queda como pantalla de interés únicamente.
- **Ecosistema**: no habrá panel admin dinámico para cargar plataformas — las nuevas se agregan
  hardcodeadas vía actualización de la app.
- **AgroClima, AgroMercado, AgroTV**: descartados, no se van a construir.

## Para profundizar

- Detalle técnico completo del proyecto (stack, estructura, convenciones): `CLAUDE.md`
- Features planificadas con diseño técnico (schema, pantallas, orden de construcción): `docs/ESTRUCTURA-Y-ROADMAP.md`
- Guía corta para sesiones de desarrollo con poco contexto: `AGENTS.md`
