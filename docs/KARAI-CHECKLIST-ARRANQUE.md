# Karai — Checklist de arranque

> Versión en texto del checklist interactivo publicado como artifact. Lo bloqueante frena poder construir
> en serio; el resto se puede resolver en paralelo al desarrollo. Última actualización: 2026-08-26.

## Parte 1 — Qué falta para empezar

### Meta / WhatsApp Business Cloud API
- [ ] **(bloqueante)** Número de WhatsApp dedicado para Karai — no puede estar ya activo en WhatsApp normal o Business App; hay que liberarlo o dar de alta uno nuevo paraguayo.
- [ ] **(bloqueante)** WhatsApp Business Account (WABA) creada dentro del Business Manager de Meta de Agroconecta.
- [ ] **(bloqueante)** Business Verification iniciada en Meta — sin esto el límite de conversaciones/día arranca muy bajo, y puede tardar varios días hábiles.
- [ ] **(bloqueante)** System User + token permanente + App Secret generados (el token temporal expira cada 24hs).

### OpenAI
- [ ] **(bloqueante)** Cuenta con billing activo y límite de gasto (hard limit) configurado.

### Supabase / esquema real
- [ ] **(bloqueante)** Definir el flujo de vinculación número ↔ cuenta (¿matching automático contra `profiles.phone`, o pedir un código?).
- [ ] **(bloqueante)** Migraciones nuevas: vínculo whatsapp↔cuenta, contador de consultas diarias, eventos de campo (adaptar el schema de hacienda/grano/gasto del piloto original al Supabase real, con RLS).

### Producto
- [ ] **(bloqueante)** Prompt de sistema y tono en español paraguayo (la primera versión tenía tono argentino).
- [ ] (para pulir después) Actualizar `/politica` con el procesamiento de mensajes por IA.
- [ ] (para pulir después) Plantillas de mensaje aprobadas por Meta, necesarias si el reporte semanal se manda fuera de la ventana de 24hs de conversación.

## Parte 2 — Todas las aristas (detalles de perfil y UX de WhatsApp)

### Perfil de WhatsApp Business
- [ ] Foto de perfil (isologo de Karai/Agroconecta, formato cuadrado)
- [ ] Nombre para mostrar ("Karai" a secas o "Karai · Agroconecta")
- [ ] Categoría de negocio en Meta (Agricultura o Tecnología)
- [ ] Descripción / "Info" del perfil
- [ ] Horario mostrado en el perfil ("disponible 24/7")

### Primer contacto
- [ ] Mensaje de bienvenida (greeting) para el primer mensaje o tras inactividad larga
- [ ] Mensaje de opt-in / consentimiento de datos
- [ ] Explicación breve de qué puede hacer Karai y sus límites según el tier
- [ ] Comando de ayuda disponible siempre ("ayuda")

### Respuestas y botones
- [ ] Botones interactivos para lo más pedido ("Próximos eventos" / "Precio de hoy" / "Cargar dato")
- [ ] Listas interactivas si hacen falta más opciones
- [ ] Indicador de "escribiendo..." mientras procesa
- [ ] Marcar como leído cada mensaje entrante

### Tono y personalidad
- [ ] "Vos" paraguayo, no "tú" ni modismos argentinos
- [ ] Toques de guaraní, sin exagerar (coherente con el nombre "Karai")
- [ ] Formato de WhatsApp consistente (*negrita* con asteriscos, mensajes cortos)
- [ ] Firma al final de cada respuesta, o no — decidir una vez y mantenerlo

### Casos borde de la conversación
- [ ] Saludos y small talk ("hola", "gracias", "chau") con respuesta natural
- [ ] Fotos, ubicación, documentos, stickers, video — respuesta clara de qué sí se puede procesar
- [ ] Mensajes desde un grupo de WhatsApp — aclarar que Karai funciona 1:1
- [ ] Mensaje al llegar al límite diario (y cómo ofrece el upgrade a Teams)
- [ ] Mensaje de error genérico si algo falla técnicamente, sin tecnicismos
- [ ] Opt-out ("no quiero más mensajes") y qué pasa con sus datos

### Detalles que se olvidan
- [ ] Formato de fecha (dd/mm/aaaa) y moneda (Gs. ganadero, USD commodities)
- [ ] Zona horaria Paraguay (cron del reporte semanal, "próximos eventos")
- [ ] Confirmación visible cuando se vincula la cuenta exitosamente
- [ ] Qué pasa si dos personas de la misma organización escriben a la vez (cuota compartida en Teams)
- [ ] Retención de audios y transcripciones — por cuánto tiempo y si se puede pedir borrado

---

Artifact interactivo original (checkboxes con progreso guardado en el navegador, no accesible desde una
sesión nueva de Claude Code): https://claude.ai/code/artifact/c869fadf-6f2e-4629-89e1-ef6f7b58ce07
