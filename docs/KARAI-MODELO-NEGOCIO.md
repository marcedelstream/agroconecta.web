# Karai — Modelo de negocio (propuesta v1, a validar)

> Documento de trabajo. Pensado para abrir junto a `docs/CONTEXTO-COMERCIAL.md` (modelo comercial general
> de Agroconecta) — Karai se diseña como una capa nueva de monetización que se apoya en el modelo B2B2C
> existente, no como un producto SaaS aparte. Última actualización: 2026-08-24.

## Qué es Karai, en una línea

El asistente conversacional de Agroconecta por WhatsApp: responde consultas cortas (próximos eventos,
noticias del día, precio de mercado hoy) leyendo los datos reales del ecosistema, y además permite a
productores y organizaciones cargar sus propios datos de campo (hacienda, grano, gastos) hablando o
escribiendo. Para ver el detalle completo de cualquier cosa, deriva a la app.

## Cómo encaja en el modelo B2B2C ya existente

Agroconecta ya monetiza vía organizaciones (Aliado Semilla/Cosecha, publicidad segmentada, leads de
servicios), no vía el usuario final. Karai sigue esa misma lógica en vez de inventar un SaaS de consumo
paralelo:

- **Starter es gratis** para cualquier usuario con perfil en la app — mismo espíritu que el resto del
  producto: la consulta rápida por WhatsApp es un gancho de retención diaria más (como el feed de
  noticias), no una fuente de ingreso directa.
- **Teams y Enterprise se venden a organizaciones**, igual que los planes Aliado — de hecho se piensan como
  un *add-on* sobre Aliado Cosecha, no como un producto de pricing independiente. Esto le da al equipo
  comercial un único pitch ("Aliado + Karai") en vez de dos conversaciones de venta separadas.
- La cuota de consultas se ata a una **cuenta/organización real de Agroconecta** (no al número de WhatsApp
  suelto) — requiere vincular el número del productor a su `profile`, y el de una organización a su
  `organization_id`. Esto es un prerrequisito técnico antes de lanzar Teams/Enterprise (ver "Requisito
  técnico" más abajo).

## Los tres tiers

| | **Starter** | **Teams** | **Enterprise** |
|---|---|---|---|
| Para quién | Cualquier productor con perfil en la app | Organización chica/mediana — veterinaria, cooperativa, agrodistribuidora, estancia | Gremios, cooperativas grandes, agroindustria, gobierno, Tigo como canal empaquetado |
| Precio propuesto | Gs. 0 | desde Gs. 350.000/mes (~USD 45) | A medida — "hablemos" |
| Consultas/día | 15 (texto). Consulta por voz cuenta doble | 200/día compartidas entre los números vinculados | Sin límite práctico, prioridad de infraestructura |
| Números de WhatsApp vinculados | 1 | Hasta 5 | Ilimitados, por sede/regional |
| Consulta (eventos/noticias/precios) | Sí | Sí | Sí + alertas proactivas personalizadas |
| Carga de datos de campo (hacienda/grano/gasto) | Vista previa — hasta 5 registros/mes | Completa, con panel de revisión | Completa + exportación / integraciones a medida |
| Reporte semanal automático | No | Sí | Sí, personalizable |
| Soporte | Self-service | Prioritario (WhatsApp/email) | SLA dedicado |
| Feature exclusiva | — | — | Cobertura en vivo de eventos (la feature "estilo OneFootball" ya prevista en el roadmap) |

Los números de precio y de cuota son un punto de partida para la conversación comercial, no un compromiso
cerrado — hay que validarlos con el equipo comercial antes de publicarlos.

## Por qué el límite no es (solo) por costo de OpenAI

Con `gpt-4o-mini` (extracción/consulta) + Whisper (audio), el costo real de una consulta corta ronda
**USD 0.0005–0.001** en texto y **USD 0.002–0.004** con audio corto — al tope gratuito de 15 consultas/día
eso es centavos por usuario por mes. La razón de tener un límite no es proteger ese costo: es (1) crear un
funnel natural de upgrade a Teams, y (2) contener el costo de conversación de WhatsApp Business Cloud API,
que sí escala con volumen y cuyas tarifas vigentes para Paraguay hay que confirmar directo con Meta antes
de fijar los topes finales — ese es el costo variable real a vigilar, no el LLM.

## Requisito técnico previo

Para que la cuota tenga sentido a nivel organización (Teams/Enterprise con varios números compartiendo
cupo), hace falta un flujo de vinculación número de WhatsApp ↔ `profile`/`organization_id` antes de
lanzar esos tiers — hoy ese vínculo no existe en el schema. Starter (individual) puede lanzar sin esto,
resolviendo la vinculación 1:1 más simple primero.

## Cómo se vende

1. **Starter viene incluido** en la app — no requiere venta, es una feature más para todos.
2. **Upsell a Teams** vía dos canales: (a) el equipo comercial que ya vende Aliado Semilla/Cosecha ofrece
   Karai Teams como parte del paquete; (b) dentro de la propia conversación de WhatsApp, cuando un usuario
   Starter llega al límite diario, Karai le informa el tope y ofrece upgrade — igual que el paywall de
   ChatGPT.
3. **Enterprise es venta directa** — gremios, cooperativas grandes, agroindustria, y potencialmente el
   propio Tigo empaquetando Karai dentro de una oferta comercial más amplia (matching con el contexto
   "Cliente: Tigo Paraguay" del proyecto).

## Riesgos y supuestos a validar

- Precios de Teams/Enterprise son ilustrativos — sin dato de mercado paraguayo de referencia todavía.
- Tarifas vigentes de WhatsApp Business Cloud API para Paraguay (conversación de servicio vs. plantilla) —
  confirmar con Meta antes de cerrar los topes de consultas.
- El flujo de vinculación número↔cuenta es un desarrollo nuevo, no reutiliza nada existente 1:1.
- La app móvil todavía no tiene su primer build publicado en las stores (ver `CONTEXTO-COMERCIAL.md`) — el
  argumento de venta de Teams/Enterprise ("cuántos usuarios activos") depende de resolver eso primero.

## Próximos pasos

1. Validar los tres tiers y precios con el equipo comercial.
2. Confirmar tarifas de WhatsApp Cloud API vigentes para Paraguay.
3. Diseñar el flujo de vinculación número de WhatsApp ↔ cuenta/organización (bloqueante para Teams/Enterprise).
4. Definir si Karai Teams se vende como línea nueva o se empaqueta directo dentro de Aliado Cosecha.
