export const SERVICE_LABELS: Record<string, string> = {
  ambiental: 'Consultoría Ambiental',
  marketing: 'Marketing Digital',
  vegetal: 'Consultoría en Producción Vegetal',
  software: 'Desarrollo Web y Software',
  publicidad: 'Publicidad en la App',
  oportunidad_comercial: 'Oportunidad comercial',
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
