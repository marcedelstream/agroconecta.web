# Agroconecta — De la propuesta institucional al siguiente paso de construcción

> Documento de cruce entre `Iniciativa_Agroconecta_Modelo_y_Propuesta_Institucional.docx` (Agosto 2026) y el
> estado real del producto. Pensado para decidir **qué construir a continuación**, no para desarrollo en sí
> — mismo espíritu que `docs/CONTEXTO-COMERCIAL.md`. Última actualización: 2026-08-13.

## Qué propone el documento institucional, en síntesis

Agroconecta se posiciona como **integrador del ecosistema agro, no competidor de sus actores**. El vehículo
comercial principal que describe es un programa de **"Aliados de la Transformación Digital del Agro"**: un
aporte institucional anual de referencia de **Gs. 3.300.000**, separado con precisión de publicidad,
patrocinio y servicios (cada uno con su propio contrato/tarifario). Define qué incluye y qué NO incluye ese
aporte, cómo comunicarlo, qué métricas de impacto reportar, riesgos a mitigar, y una ruta de crecimiento de
20 a 100+ aliados en cuatro etapas.

Es, en esencia, la **formalización institucional** de algo que el producto ya empezó a modelar técnicamente
meses atrás pero nunca terminó de operacionalizar del lado comercial.

## Cruce con lo que ya existe

| Elemento del documento | Estado real en el producto |
|---|---|
| Programa de "Aliados" con aporte anual | **Ya modelado en schema**, pero como **dos planes** (`ally_plan`: `semilla` / `cosecha`, `supabase/fix-ally-directory.sql`), no un aporte único de Gs. 3.300.000. Ver decisión pendiente abajo. |
| Reconocimiento institucional + presencia en directorio | **Directorio de Aliados ya existe en la app móvil** (`mobile/app/(main)/aliados.tsx`) con filtro por categoría, badge de plan, badge "Fundador" (`ally_founder`) y contacto directo por WhatsApp. **No existe versión pública en la web** — la web (`web/`) no tiene una página `/aliados`, solo la mención genérica en Footer/Ecosistema. |
| `ally_founder` como reconocimiento a los primeros aliados | Ya existe el campo y el badge visual en mobile. Encaja directo con la "Etapa inicial (20-25)" de la sección 11 del documento — no hace falta construir nada nuevo, es cuestión de decidir el corte de fecha/cantidad. |
| Estado comercial (`trial/active/overdue/paused`) y notas de facturación | Ya existe (`commercial_status`, `billing_notes`) y se edita a mano en `/admin/organizaciones`. **No hay cobro automático ni recordatorio cuando pasa a "vencido"** — ya señalado como bloqueo operativo en `CONTEXTO-COMERCIAL.md`. |
| Separación aporte institucional / publicidad / patrocinio / servicios | **Ya está separado a nivel de datos**, aunque nunca se documentó así explícitamente: `organizations.ally_plan` (aporte), `ad_campaigns` (publicidad segmentada), `service_leads` (servicios/consultoría/patrocinios puntuales). El documento le da nombre y reglas de comunicación a algo que el schema ya refleja — buena señal de coherencia. |
| Qué NO debe incluir el aporte (sección 6: sin cantidad garantizada de publicaciones, entrevistas, etc.) | **No hay ningún control técnico ni de proceso** que impida que un aliado publique de más — un aliado que también es `Organization` publica notas por el mismo flujo editorial que cualquier medio (`editorial_status`). Es una regla comercial, no técnica: no requiere código, requiere que quien vende/gestiona cuentas la aplique al conversar con cada aliado. |
| Reporte periódico de métricas de impacto (sección 9) | **No existe.** Hoy no hay ninguna pantalla que agregue "usuarios activos, aliados activos, capacitaciones, oportunidades publicadas" en un solo lugar — hay que armarla desde cero. |
| Directorio segmentado por categoría (`ally_category`) | Ya existe (`agricultura`, `ganadería`, `servicios`, `medios`, `instituciones`, `insumos_maquinaria`, `tecnología`, `otros`) y se usa como filtro en mobile. |
| Verticales comerciales nuevas (sección 12: clasificados, empleos premium, cursos pagos, etc.) | Coincide con lo ya planificado en `docs/ESTRUCTURA-Y-ROADMAP.md` sección 8 (Descubrir como módulos reales) — no es nueva información, confirma la misma dirección. |
| "Inteligencia de mercado" basada en datos agregados/anonimizados (sección 13) | No existe ningún agregado de este tipo todavía. Requeriría definir qué señales se pueden reportar sin exponer usuarios individuales — diseño de producto, no una feature urgente. |

## Decisiones de negocio a tomar antes de construir nada

Esto es lo único que realmente bloquea el siguiente paso — no es código, son decisiones tuyas:

1. **¿El aporte de Gs. 3.300.000 reemplaza a Semilla/Cosecha, o convive con ellos?**
   Tal como está hoy el schema, hay dos planes con presumiblemente dos precios distintos. El documento
   institucional habla de un aporte único de referencia. Antes de tocar el admin hay que decidir: ¿Semilla y
   Cosecha pasan a ser dos formas de cumplir el mismo programa (ej. Cosecha = aporte + algo más), o el
   documento institucional describe un tercer nivel de entrada por debajo de Semilla?

2. **¿Quién queda como "Aliado Fundador"?**
   El campo ya existe técnicamente. Falta el criterio de negocio: ¿los primeros 20-25 aliados que firmen
   desde ahora, o también cuentan los que ya están cargados con `ally_plan` hoy?

3. **¿Se publica un directorio de Aliados en la web, además de en la app?**
   El documento institucional está pensado para presentarse a organizaciones que probablemente van a buscar
   "Agroconecta aliados" antes de firmar nada — hoy esa búsqueda no encuentra nada en `agroconecta.com.py`.

## Pasos de construcción sugeridos, en orden (si corresponde avanzar)

Ninguno de estos arranca hasta que confirmes las tres decisiones de arriba — construir el admin antes de
saber si hay dos planes o uno es el error más caro de deshacer después.

1. **Directorio de Aliados en la web pública** (`web/app/aliados/page.tsx`) — reutiliza exactamente el mismo
   patrón visual que ya armamos para las notas (`CategoryEyebrow`, tarjetas tipo grid) aplicado a
   organizaciones en vez de posts. Esfuerzo bajo: la data y los campos ya existen (`ally_plan`,
   `ally_category`, `ally_founder`, `logo_url`, `contact_phone`), solo falta la vista y la query.
2. **Admin — vista de vencimientos** en `/admin/organizaciones`: filtro/orden por `commercial_status =
   'overdue'` y por fecha de próximo vencimiento, para que cobrar deje de depender de acordarse. No requiere
   pasarela de pago todavía, solo visibilidad.
3. **Reporte de impacto (sección 9 del documento)**: una pantalla admin simple (o incluso una consulta SQL
   documentada, si no se justifica una pantalla todavía) que junte los números que el documento promete
   reportar a los aliados: usuarios activos, aliados activos por categoría, oportunidades publicadas
   (`EcosystemListing`), alcance territorial agregado.
4. **Plantilla de "Acuerdo de Aliado"** (documento, no código): convertir las secciones 5-8 del documento
   institucional (qué incluye/no incluye, separación de conceptos) en un documento corto de una página que
   se firme o se envíe por email a cada organización antes de cobrar el primer aporte. Esto evita el riesgo
   que el propio documento señala en la sección 10 ("expectativas de aliados").
5. **Cobro** (pasarela de pago o al menos recordatorio automático por email) — ya identificado como bloqueo
   en `CONTEXTO-COMERCIAL.md`, sigue siendo el paso más caro técnicamente y el de menor prioridad hasta que
   haya más de un puñado de aliados pagando a mano.

## Qué de este documento institucional NO requiere construcción

Buena parte del documento (secciones 8, 10, 15 — comunicación del uso de recursos, mitigación de riesgo
reputacional, criterio de comunicación institucional) es **guía de redacción y de conversación comercial**,
no producto. No hay nada que programar ahí — es material para quien redacte publicaciones, hable con
aliados potenciales o arme el pitch. Vale la pena mantenerlo como referencia separada (podría vivir como
anexo de `docs/CONTEXTO-COMERCIAL.md`) en vez de mezclarlo con el roadmap técnico.
