# Karai — Plan maestro de entrenamiento, fuentes y producto

> Documento operativo para convertir a Karai en la IA paraguaya de referencia para el agro. Define qué existe hoy, cómo debe incorporar conocimiento, qué fuentes puede usar, cómo se valida cada respuesta y cómo se prepara la oferta Pro/Enterprise.
>
> Fecha: 2026-09-01. Estado: plan de ejecución v1.

## 1. Diagnóstico: dónde está Karai hoy

Karai vive actualmente dentro del proyecto web, no como un servicio separado:

| Área | Ubicación | Estado actual |
|---|---|---|
| Entrada pública | `web/app/karai/` | Chat web, login, membresía, sesiones y datos de finca |
| Subdominio | `web/proxy.ts` | `karai.agroconecta.com.py` reescribe hacia `/karai` |
| Orquestación | `web/lib/karai/orchestrator.ts` | Clasifica, controla membresía/cuota, arma contexto, llama al modelo y persiste mensajes |
| Proveedor IA | `web/lib/karai/ai-provider.ts` | Adaptador OpenAI desacoplado, con respuesta normal y streaming |
| Reglas de alcance | `web/lib/karai/classifier.ts` y `types.ts` | Bloqueo previo de temas fuera de agro o inseguros |
| Datos vivos | `web/lib/karai/context.ts` | Lee noticias publicadas, precios y datos privados de la finca del usuario |
| Eventos propios | `web/lib/karai/events-context.ts` | Consulta eventos aprobados y próximos del Supabase separado de eventosagropy.com |
| Biblioteca del equipo | `web/app/admin/(dashboard)/karai/fuentes/` | Alta, activación y baja de links/documentos; admite texto pegado y `.docx` |
| Persistencia | `supabase/fix-karai-foundations.sql` y `fix-karai-farm-and-knowledge.sql` | Conversaciones, mensajes, uso, perfil de finca y `karai_knowledge_sources` |
| Control comercial | `web/lib/karai/quota.ts` y `web/app/admin/(dashboard)/karai/` | Cuota, miembros y leads comerciales |

### Lo que ya está bien encaminado

- Karai ya recibe contexto separado del mensaje del usuario, lo que reduce el riesgo de que un texto cargado en una noticia o documento se interprete como una instrucción.
- La información privada de finca se limita al `profileId` autenticado.
- Los eventos de eventosagropy.com ya se incorporan al contexto en cada consulta cuando existen las variables de entorno correspondientes.
- Las noticias y precios se consultan desde las tablas reales del ecosistema, no desde datos de demostración.
- El equipo ya tiene un panel para cargar fuentes confiables.

### Lo que todavía impide llamarla “la IA oficial del agro paraguayo”

1. La biblioteca documental todavía es una lista de textos truncados: no hay extracción por fragmentos, búsqueda semántica, fecha de vigencia, nivel de autoridad ni trazabilidad por respuesta.
2. No existe un catálogo formal de fuentes sociales ni un proceso de verificación antes de que una publicación entre al conocimiento de Karai.
3. Los datos de eventosagropy.com entran como contexto, pero no tienen todavía un registro de sincronización, versión, URL canónica ni estado de calidad visible.
4. La respuesta no tiene un contrato obligatorio de citas/fuentes para precios, eventos, normativa o recomendaciones sensibles.
5. No hay un set de evaluaciones paraguayo que mida exactitud, actualidad, tono, guaraní, seguridad, abstención y resistencia a instrucciones maliciosas.
6. Falta una separación técnica completa entre plan individual, Pro/Teams y Enterprise: límites, espacios de conocimiento, roles, auditoría, exportación y SLA.

## 2. Principio rector: Karai no se entrena con una bolsa de internet

En este producto, “entrenar” significa cinco cosas distintas:

1. **Diseñar comportamiento:** instrucciones, tono, alcance, límites y formato de respuesta.
2. **Conectar datos vivos:** consultas directas a Agroconecta y eventosagropy.com para precios, noticias y eventos.
3. **Construir una biblioteca verificada:** documentos, reglamentos, manuales, fichas técnicas y fuentes externas aprobadas.
4. **Dar herramientas con permisos:** funciones para consultar, comparar, registrar datos de finca, generar alertas y derivar leads.
5. **Evaluar y corregir continuamente:** casos reales anonimizados, revisión humana y pruebas automáticas.

No conviene empezar con fine-tuning. Primero hay que conseguir recuperación correcta, fuentes citables y un comportamiento medible. La búsqueda de archivos de OpenAI está pensada para que el modelo consulte una base documental mediante búsqueda semántica y por palabras clave; eso encaja con la biblioteca aprobada, mientras que los datos variables deben seguir viniendo de las tablas y APIs de Agroconecta. [Documentación oficial de OpenAI sobre File Search](https://developers.openai.com/api/docs/guides/tools-file-search)

## 3. Orden oficial de autoridad de las fuentes

Karai debe elegir la fuente por tipo de pregunta, no por “lo último que encontró”. Este es el orden obligatorio:

### Nivel A — Datos propios vivos y estructurados

Fuente preferida para datos que cambian:

- `posts` publicados y revisados en Agroconecta.
- `market_prices`, con mercado, moneda, unidad, valor y `updated_at`.
- `events` aprobados de eventosagropy.com.
- Organizaciones y aliados verificados de Agroconecta.
- Datos privados registrados por el propio usuario en su finca.

Regla: si la pregunta pide “hoy”, “ahora”, “próximo”, “esta semana” o un valor numérico, Karai debe consultar la fuente viva y mencionar su fecha/hora. Nunca debe completar un precio faltante con memoria.

### Nivel B — Documentación oficial cargada y aprobada por Agroconecta

- Normativas, resoluciones, manuales y protocolos oficiales.
- Documentos institucionales entregados por aliados.
- Fichas técnicas de productos o servicios con responsable identificable.
- Informes propios de Agroconecta con fecha, autor y revisión.

Regla: un documento cargado no es automáticamente verdad. Debe tener responsable, fecha de emisión, fecha de revisión, jurisdicción, tema, nivel de autoridad y estado `pendiente/aprobado/vencido/retirado`.

### Nivel C — Sitios oficiales externos permitidos

Ejemplos de familias de fuente a curar: instituciones públicas paraguayas, universidades, gremios, organismos sanitarios, mercados y organizaciones técnicas reconocidas. Cada dominio debe ser aprobado individualmente y tener un responsable interno.

Regla: se puede usar solo si la URL es canónica, la página es accesible, tiene fecha o vigencia razonable y supera la revisión editorial. Una web oficial no vuelve correcta cualquier opinión publicada en ella.

### Nivel D — Redes sociales oficiales

Las cuentas de Instagram, Facebook, YouTube, TikTok, X o LinkedIn pueden servir para detectar anuncios, fechas, videos y comunicados, pero no deben tratarse como autoridad por defecto.

Proceso obligatorio:

1. verificar que la cuenta pertenece a la organización;
2. capturar URL, fecha, texto y medio original;
3. clasificarla como anuncio, noticia, opinión, promoción o dato técnico;
4. pedir confirmación o contrastarla con web/documento oficial si implica precio, normativa, sanidad, seguridad o recomendación productiva;
5. publicar en Agroconecta solo después de revisión, o mantenerla fuera del conocimiento de Karai como señal no confirmada.

### Nivel E — Web abierta bajo demanda

Debe ser una válvula controlada, no la memoria operativa de Karai. Solo se usa cuando Agroconecta no tiene el dato, el usuario lo necesita y la consulta permite fuentes públicas verificables. La respuesta debe distinguir claramente “fuente externa consultada” de “dato de Agroconecta”. Para decisiones críticas, Karai debe abstenerse o derivar a un profesional.

### Nivel F — Memoria del modelo

Solo sirve para explicar conceptos generales. Nunca es autoridad para precios, fechas, normativa paraguaya, dosis, diagnósticos, mercados o datos actuales.

## 4. Arquitectura de conocimiento objetivo

### 4.1 Enrutador de intención

Antes de llamar al modelo, clasificar la consulta en una de estas familias:

| Intención | Fuente/herramienta principal |
|---|---|
| Precio o mercado | `market_prices` + fecha y mercado |
| Evento | `eventsagropy.com` + detalle canónico |
| Noticias | `posts` publicados |
| Documento/normativa | biblioteca verificada + búsqueda documental |
| Pregunta técnica | biblioteca técnica aprobada; si falta, fuente externa autorizada |
| Mi finca | datos privados del usuario + cálculo controlado |
| Acción | función explícita con permisos, nunca una promesa textual |
| Compra/venta/oportunidad | respuesta + lead mínimo y consentimiento |
| Fuera de alcance o riesgo | rechazo/derivación antes del modelo |

### 4.2 Registro de fuentes

Evolucionar `karai_knowledge_sources` para incorporar como mínimo:

```text
id, kind, title, canonical_url, publisher, source_level,
topic, geography, language, issued_at, reviewed_at, expires_at,
status, verification_notes, reviewer_id, checksum, ingestion_run_id
```

Para cada documento o página:

- conservar el original o su URL canónica;
- extraer texto y dividirlo en fragmentos con encabezado y página/sección;
- guardar metadatos por fragmento;
- registrar quién aprobó la fuente y cuándo;
- poder retirarla sin borrar el historial de respuestas;
- impedir que una fuente vencida se use para una respuesta vigente, salvo que se muestre como histórica.

### 4.3 RAG híbrido, no contexto gigante

La secuencia recomendada es:

1. consultar primero tablas y APIs determinísticas;
2. buscar en la biblioteca documental por palabras clave y semántica;
3. filtrar por Paraguay, departamento, especie/cultivo, fecha y nivel de autoridad;
4. entregar al modelo solo los fragmentos pertinentes;
5. exigir que la salida devuelva `source_id`, título, fecha y enlace cuando corresponda;
6. abstenerse si no se supera un umbral de relevancia o si las fuentes se contradicen.

## 5. Cómo debe incorporar cada tipo de información

### Noticias y contenido Agroconecta

El importador existente de fuentes sindicadas debe producir `posts` con origen, URL original, fecha de publicación y estado editorial. Karai solo usa publicaciones `published`. Para evitar duplicados o rumores, no se debe indexar directamente el RSS bruto como conocimiento final.

### Precios

Los precios deben permanecer estructurados. Cada valor necesita mercado, moneda, unidad, fecha de actualización, fuente y responsable. La respuesta debe decir “último precio cargado” cuando no exista actualización del día; nunca “precio de hoy” por defecto.

### Eventosagropy.com

Debe ser una fuente de primer nivel para eventos, siempre consultada para preguntas de agenda. El plan técnico incluye:

- sincronización periódica y registro de `last_sync`, cantidad leída y errores;
- URL/slug canónico del evento;
- fecha local de Paraguay, hora, lugar, ciudad y departamento;
- estado `aprobado`, cancelado, reprogramado o vencido;
- enlace al detalle de eventosagropy.com;
- prueba automática que detecte eventos pasados mostrados como próximos;
- cache de contingencia claramente rotulado si el Supabase externo está temporalmente caído.

### Documentos cargados por el equipo

El panel debe pasar de “cargar texto” a un flujo editorial:

`Borrador → revisión de contenido → aprobación → indexación → monitoreo de vigencia → renovación o retiro`.

Cada documento debe declarar a quién aplica. Un manual de una empresa no puede responder como si fuera una norma nacional.

### Redes sociales

No se debe raspar indiscriminadamente ni copiar contenido protegido. Registrar únicamente lo necesario para validar y enlazar. Las redes alimentan una cola de verificación; no alimentan automáticamente la respuesta final.

## 6. Comportamiento de respuesta que hay que entrenar

Karai debe responder con una plantilla mental consistente:

1. **Respuesta directa** en español paraguayo y con “vos”.
2. **Dato concreto** con fecha, unidad, zona o condición.
3. **Fuente o fuentes** con título, enlace y vigencia cuando el dato sea verificable.
4. **Nivel de certeza:** confirmado, estimación, referencia externa o no disponible.
5. **Próximo paso útil:** enlace a Agroconecta, evento, documento, profesional o registro de finca.

Reglas especiales:

- En medicina veterinaria, fitosanidad, toxicología, alimentos, seguridad, legal y finanzas: informar límites, no diagnosticar ni indicar dosis críticas sin datos suficientes y derivar a profesional.
- Si hay dos fuentes en conflicto, mostrar el conflicto y priorizar la de mayor autoridad/fecha; no inventar una síntesis.
- Si falta información: decir “Agroconecta todavía no tiene ese dato” y ofrecer cargarlo o buscar una fuente autorizada.
- No revelar datos privados de otra persona, organización o finca.
- No usar conversaciones privadas para entrenar el conocimiento público sin anonimización y consentimiento.
- En guaraní, usar expresiones claras y moderadas; no traducir términos técnicos de forma inventada.

## 7. Programa de entrenamiento en fases

### Fase 0 — Gobierno y definición de “oficial” (semana 1)

- Nombrar un responsable editorial de Karai y responsables por dominio: ganadería, agricultura, mercados, eventos, normativa y comercial.
- Aprobar la taxonomía de fuentes y los estados de vigencia.
- Crear una política de corrección, retiro y respuesta ante reclamos.
- Definir categorías de alto riesgo y reglas de derivación.
- Congelar 100 preguntas de referencia para medir el punto de partida.

**Salida:** manual editorial y catálogo inicial de fuentes autorizadas.

### Fase 1 — Fundación de datos confiables (semanas 2–4)

- Completar metadatos de `karai_knowledge_sources`.
- Agregar origen y URL canónica a posts, precios y eventos.
- Implementar registro de sincronización de eventosagropy.com.
- Incorporar búsqueda por fecha, departamento, cultivo/especie y autoridad.
- Mostrar la fuente utilizada en el panel de administración.

**Salida:** cada respuesta factual puede rastrearse a un registro o fragmento.

### Fase 2 — Biblioteca documental y recuperación (semanas 5–7)

- Extraer PDF/DOCX/HTML con control de tamaño y formato.
- Fragmentar por títulos, párrafos y páginas.
- Indexar en un vector store o una capa de búsqueda equivalente, manteniendo Supabase como catálogo de autoridad.
- Implementar filtros de vigencia y jurisdicción.
- Ensayar respuestas con documentos contradictorios y documentos maliciosos.

**Salida:** Karai encuentra el fragmento correcto y cita el documento correcto.

### Fase 3 — Herramientas de Agroconecta (semanas 8–11)

- `get_latest_market_price`.
- `search_news`.
- `search_upcoming_events`.
- `get_event_detail`.
- `search_verified_knowledge`.
- `get_my_farm_profile`.
- `save_farm_fact` con confirmación y auditoría.
- `create_commercial_lead` con consentimiento explícito.
- `subscribe_to_alert` para funciones futuras Pro/Enterprise.

Las funciones deben validar permisos y esquemas en código. El modelo puede solicitar una herramienta, pero no puede decidir por sí solo qué datos privados exponer.

### Fase 4 — Evaluación y entrenamiento continuo (desde la semana 4)

Crear un dataset versionado de preguntas y respuestas esperadas, separado por:

- exactitud de precios;
- actualidad de eventos;
- atribución de fuentes;
- normativa paraguaya;
- recomendaciones técnicas;
- datos de finca y privacidad;
- ventas y leads;
- español paraguayo/guaraní;
- prompt injection y contenido engañoso;
- abstención correcta.

Cada cambio de prompt, fuente, modelo o herramienta debe correr este set antes de producción. La plataforma de Evals de OpenAI permite crear evaluaciones y ejecutarlas contra modelos y configuraciones; debe complementar, no reemplazar, la revisión de especialistas paraguayos. [Guía oficial de Evals de OpenAI](https://developers.openai.com/api/docs/guides/evals)

### Fase 5 — Voz, WhatsApp y proactividad (semanas 12–16)

- WhatsApp con identidad de número verificada y vínculo a perfil/organización.
- Audio: transcripción, confirmación de datos ambiguos y registro de idioma.
- Alertas solo con suscripción y consentimiento.
- Reportes semanales con fuentes, período y destinatarios.
- Cola humana para preguntas que Karai no puede resolver.

## 8. Métricas de calidad antes de escalar

No lanzar Pro/Enterprise solo porque “responde lindo”. Los umbrales iniciales recomendados son:

| Métrica | Umbral de lanzamiento |
|---|---:|
| Respuestas correctas en preguntas de datos propios | ≥ 95% |
| Precios con unidad, moneda y fecha correctas | ≥ 98% |
| Eventos próximos/pasados correctamente clasificados | ≥ 99% |
| Respuestas con fuente cuando corresponde | ≥ 95% |
| Abstención correcta en datos ausentes o contradictorios | ≥ 90% |
| Cero filtraciones en pruebas de privacidad | 100% |
| Resistencia a instrucciones embebidas maliciosas | ≥ 95% |
| Latencia p95 del chat web | definir después de medir; objetivo inicial < 8 s |
| Correcciones humanas por 100 respuestas | tendencia descendente; objetivo inicial < 5 |

## 9. Producto Pro/Enterprise

La monetización debe vender confiabilidad, datos propios y operación, no solamente más mensajes.

### Pro / Teams

- espacio privado de conocimiento de la organización;
- hasta 5 números o usuarios vinculados;
- documentos y protocolos internos;
- preguntas sobre operaciones, clientes, productos o campañas;
- alertas de precios/eventos;
- reportes semanales;
- panel de uso, fuentes y correcciones;
- roles de administrador, editor y lector;
- soporte prioritario.

### Enterprise

- múltiples sedes, cooperativas o regionales;
- separación estricta por tenant;
- SSO o integración de identidad cuando corresponda;
- conectores a ERP/CRM o bases del cliente;
- API y exportaciones;
- auditoría completa de consultas y fuentes;
- políticas de retención configurables;
- SLA, monitoreo y canal de escalamiento;
- modelos, límites y alertas de costo configurables;
- marca compartida o canal empaquetado con aliados estratégicos.

### Entidades técnicas que faltan para vender esos planes

- `subscriptions` y `entitlements` reales, separados de `user_subscriptions` (que hoy representa seguir organizaciones);
- `organization_knowledge_sources` y permisos por tenant;
- `phone_identities` verificadas;
- roles de finca/organización;
- `audit_logs`;
- ledger de uso por usuario, organización, canal y herramienta;
- consentimientos revocables;
- exportación y borrado por tenant;
- health checks de fuentes y eventos.

## 10. Backlog prioritario

### Ahora

1. Crear catálogo de fuentes y responsables.
2. Agregar metadatos y trazabilidad a la base de conocimiento.
3. Corregir el contexto para que cada noticia, precio y evento lleve identificador/enlace/fecha.
4. Crear el dataset de 100 preguntas y una revisión humana semanal.
5. Implementar pruebas automáticas de eventos vencidos, precio sin fecha y fuga de datos privados.

### Después

6. RAG documental con fragmentos y filtros.
7. Herramientas determinísticas para noticias, precios, eventos y finca.
8. Cola de verificación de redes sociales.
9. Identidad WhatsApp y planes Pro/Teams.
10. Alertas, reportes, auditoría y Enterprise.

### Decisión que no conviene tomar todavía

No fijar precio definitivo ni prometer “sin límites” antes de medir consumo por canal, costo de WhatsApp, calidad de fuentes y volumen de soporte. El valor Enterprise estará en el conocimiento privado, la trazabilidad, la integración y el SLA.

## 11. Definición de éxito

Karai será la IA oficial del agro paraguayo cuando pueda responder, para cada dato importante:

> “Esto es lo que sé, esta es la fuente, esta es la fecha, este es el alcance geográfico, esto es lo que no sé y este es el siguiente paso.”

La ventaja competitiva no será solo el modelo. Será la combinación de contenido paraguayo curado, datos vivos de Agroconecta, cobertura propia de eventosagropy.com, memoria privada protegida, operadores humanos y una disciplina de evaluación que permita vender confianza.
