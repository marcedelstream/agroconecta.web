export const SERVICE_LABELS: Record<string, string> = {
  ambiental: 'Consultoría Ambiental',
  comunicacion: 'Consultoría en Comunicación',
  marketing: 'Marketing Digital',
  vegetal: 'Consultoría en Producción Vegetal',
  software: 'Desarrollo Web y Software',
  publicidad: 'Publicidad en la App',
  oportunidad_comercial: 'Oportunidad comercial',
  suscripcion_karai_campo: 'Quiere KARAI Campo',
  suscripcion_organizacion: 'Quiere el plan Organizaciones',
  karai_campo_web: 'Pidió KARAI Campo (web)',
  suscripcion_organizacion_web: 'Quiere el plan Organizaciones (web)',
  'membresia-anual': 'Membresía anual',
  'publicar-evento': 'Publicar evento',
  'publicar-empleo': 'Publicar empleo',
  'publicar-clasificado': 'Publicar clasificado',
  'publicar-curso': 'Publicar curso',
}

// A qué sección del admin manda el botón "Crear publicación →" de cada pedido `publicar-*`.
export const PUBLISH_LEAD_TARGETS: Record<string, string> = {
  'publicar-evento': '/admin/eventos',
  'publicar-empleo': '/admin/ecosistema?kind=empleo',
  'publicar-clasificado': '/admin/ecosistema?kind=clasificado',
  'publicar-curso': '/admin/ecosistema?kind=curso',
}
