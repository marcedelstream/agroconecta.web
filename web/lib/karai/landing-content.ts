// Contenido de la vidriera pública de Karai (web/app/karai/_landing). Se edita acá, sin tocar el
// diseño de la página.

// Abren el chat con la pregunta ya enviada (ChatClient lee ?q=). Sin sesión pasan antes por el login.
export const EXAMPLE_QUESTIONS = [
  '¿Cuánto está el novillo hoy?',
  '¿Cuándo son los próximos remates?',
  '¿Cuándo siembro sésamo en San Pedro?',
  '¿Cómo registro mi hacienda?',
  '¿Qué hago contra la garrapata?',
  '¿Qué eventos del sector hay este mes?',
]

export const TODAY_FEATURES = [
  { title: 'Precios del día', text: 'Ganado, granos y commodities, con la fecha del dato.' },
  { title: 'Agenda del sector', text: 'Remates, ferias y eventos con fecha y lugar.' },
  { title: 'Tu establecimiento', text: 'Le contás tus animales y hectáreas, y responde con tus números.' },
  { title: 'Negocios', text: 'Si querés comprar o vender, le avisa al equipo de Agroconecta.' },
]

export interface KaraiPartner {
  name: string
  // Ruta en /public o URL absoluta; los logos van sobre fondo claro.
  logoUrl: string
  website?: string
}

// Gremios y organizaciones que aportan material a Karai. Vacía hasta que se firme el primero.
export const KARAI_PARTNERS: KaraiPartner[] = []

export const COMING_SOON = [
  { title: 'Karai por WhatsApp', text: 'Las mismas respuestas, en el chat que ya usás todos los días.' },
  { title: 'Consultas por voz', text: 'Mandás un audio desde el campo y Karai te contesta.' },
  { title: 'Alertas de precios', text: 'Un aviso cuando el novillo o la soja llegan al precio que esperás.' },
  { title: 'Reporte semanal', text: 'Un resumen de mercado y clima pensado para tu rubro y tu zona.' },
  { title: 'Karai Teams', text: 'Karai para gremios, cooperativas y empresas, con el material propio de cada organización.' },
]

export const ORG_TYPES = ['Gremio o asociación', 'Cooperativa', 'Empresa', 'Institución pública', 'Otro'] as const
