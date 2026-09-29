import type { FeedContentType } from './types'

export const TYPE_LABEL: Record<FeedContentType, string> = {
  noticia: 'NOTICIA',
  video: 'VIDEO',
  evento: 'EVENTO',
  curso: 'CURSO',
  producto: 'PRODUCTO',
  servicio: 'SERVICIO',
  empleo: 'EMPLEO',
  remate: 'REMATE',
  libro: 'LIBRO',
}

/** Tipos que usan el botón de acción: los de contenido + la tarjeta "Tu mercado hoy". */
export type CtaKind = FeedContentType | 'precios' | 'patrocinado'

// Texto del botón de acción estandarizado (README §3.1): mismo botón siempre, solo cambia esto.
export const CTA_LABEL: Record<CtaKind, string> = {
  noticia: 'Ver noticia',
  video: 'Ver video',
  evento: 'Ver evento',
  curso: 'Ver curso',
  producto: 'Ver producto',
  servicio: 'Ver servicio',
  empleo: 'Ver oportunidad',
  remate: 'Ver remate',
  libro: 'Ver libro',
  precios: 'Ver todos los precios',
  patrocinado: 'Ver promoción',
}

/** El anunciante puede cargar su propio texto (máx. 18 caracteres, lo valida la base). */
export const CTA_MAX_LENGTH = 18

export const FEED_TEXT = {
  brand: 'Agroconecta',
  search: 'Buscar',
  publish: 'Publicar',
  like: 'Me gusta',
  save: 'Guardar',
  saved: 'Guardado',
  share: 'Enviar',
  shareA11y: 'Compartir',
  follow: 'Seguir',
  unfollow: 'Dejar de seguir',
  play: 'Reproducir video',
  live: 'EN VIVO',
  emptyTitle: 'Todavía no hay contenido',
  emptyBody: 'Deslizá hacia abajo para actualizar.',
  errorTitle: 'No pudimos cargar tu feed',
  errorBody: 'Revisá tu conexión y probá de nuevo.',
  retry: 'Reintentar',
  marketChip: 'MERCADO',
  marketTitle: 'Tu mercado hoy',
  marketUpdated: 'Actualizado',
  marketEmpty: 'Los precios no están disponibles en este momento.',
  refreshing: 'Actualizando…',
} as const

export const DETAIL_TEXT = {
  close: 'Cerrar',
  follow: 'Seguir',
  following: 'Siguiendo',
  remindOff: 'Activar recordatorio',
  remindOn: 'Recordatorio activado',
  watchLive: 'Ver transmisión en vivo',
  save: 'Guardar',
  saved: 'Guardado',
  share: 'Compartir',
  eventHub: 'Ver programa y noticias del evento',
  fullVideo: 'Ver video completo',
  readBook: 'Leer libro',
  contact: 'Contactar',
  toastRemindOn: 'Te avisamos 1 hora antes',
  toastRemindOff: 'Recordatorio desactivado',
  toastDenied: 'Activá las notificaciones en los ajustes del teléfono',
  toastSaved: 'Guardado en tu lista',
  toastUnsaved: 'Quitado de Guardados',
  toastError: 'No pudimos guardar el cambio. Probá de nuevo.',
} as const

export const PRICES_TEXT = {
  title: 'Mercado',
  back: 'Volver',
  share: 'Compartir precios',
  search: 'Buscar precios',
  clearSearch: 'Borrar búsqueda',
  cattle: 'Ganado',
  international: 'Internacional',
  featured: 'DESTACADO',
  updatedToday: 'Actualizado hoy',
  noUpdates: 'Sin actualizaciones',
  emptyTitle: 'Precios no disponibles',
  emptyBody: 'Todavía no hay precios cargados. Volvé a revisar más tarde.',
  noResults: 'No encontramos precios con esa búsqueda.',
  disclaimer: 'Valores de referencia. No constituyen una cotización oficial.',
  shareCattle: 'Precios de Ganado',
  shareInternational: 'Precios Internacionales',
} as const

export const EXPLORE_TEXT = {
  title: 'Explorar',
  search: 'Buscar en Agroconecta',
  clearSearch: 'Borrar búsqueda',
  categories: 'CATEGORÍAS',
  trending: 'TENDENCIAS',
  clear: 'Limpiar',
  resultsFor: 'Resultados para',
  noResults: 'No encontramos nada con eso. Probá con “soja”, “remate” o “curso”.',
  error: 'No pudimos cargar los resultados.',
  retry: 'Reintentar',
  pricesTitle: 'Precios de hoy',
  pricesBody: 'Ganado e internacionales',
  posts: (n: number) => (n === 1 ? '1 publicación' : `${n} publicaciones`),
} as const

export const RUBROS: { value: string; label: string }[] = [
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'ganaderia', label: 'Ganadería' },
  { value: 'horticultura', label: 'Horticultura' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'mercados', label: 'Mercados' },
]

export const CATEGORY_LABEL: Record<FeedContentType, string> = {
  noticia: 'Noticias',
  evento: 'Eventos',
  video: 'Videos',
  curso: 'Cursos',
  producto: 'Productos',
  servicio: 'Servicios',
  empleo: 'Empleos',
  remate: 'Remates',
  libro: 'Biblioteca',
}

export const GUARDADOS_TEXT = {
  title: 'Guardados',
  tabSaved: 'Guardados',
  tabReminders: 'Recordatorios',
  tabActivity: 'Actividad',
  emptySavedTitle: 'Todavía no guardaste nada',
  emptySavedBody: 'Tocá el ícono de guardar en cualquier publicación del Inicio y la vas a encontrar acá.',
  emptyRemindersTitle: 'No tenés recordatorios',
  emptyRemindersBody: 'Abrí un evento o un remate y tocá "Activar recordatorio".',
  remindersNote: 'Te avisamos 1 hora antes.',
  activityNote: 'Tu actividad de los últimos 30 días.',
  activity: { viewed: 'Contenido visto', events: 'Eventos visitados', products: 'Productos consultados' },
  activityNone: 'Nada todavía',
  error: 'No pudimos cargar tus guardados.',
  retry: 'Reintentar',
  reminderSwitch: 'Recordatorio',
  guestTitle: 'Tus guardados, en un solo lugar',
  guestBody: 'Iniciá sesión para guardar noticias, eventos y cursos, activar recordatorios y ver tu actividad.',
} as const

export const PROFILE_TEXT = {
  edit: 'Editar perfil',
  more: 'Más opciones',
  completeCv: 'Completá tu perfil profesional',
  completeCvBody: 'Sumá tu cargo, formación y experiencia. Así te conocen el resto de los productores y profesionales.',
  completeCvCta: 'Completar perfil',
  about: 'Sobre mí',
  experience: 'Experiencia',
  specialties: 'Especialidades',
  education: 'Formación',
  organizations: 'Organizaciones que seguís',
  socials: 'Redes sociales',
  manageOrgs: 'Gestionar',
  noOrgs: 'Todavía no seguís a ninguna organización.',
  share: 'Compartir perfil',
  shareMessage: (name: string, url: string) => `Mirá el perfil de ${name} en Agroconecta${url ? `: ${url}` : ''}`,
  shareNeedsPublic: 'Activá "Perfil público" y elegí tu dirección para compartirlo.',
  followingCount: (n: number) => (n === 1 ? 'Seguís 1 organización.' : `Seguís ${n} organizaciones.`),
  socialLabel: { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', x: 'X', youtube: 'YouTube', website: 'Sitio web' },
  avatarTitle: 'Foto de perfil',
  avatarBody: 'Se guarda solo en este dispositivo.',
  avatarChange: 'Cambiar foto',
  avatarRemove: 'Quitar foto',
  cancel: 'Cancelar',
  guestTitle: 'Iniciá sesión',
  guestBody: 'Entrá con tu cuenta para guardar contenido, seguir organizaciones y armar tu perfil.',
  guestCta: 'Iniciar sesión',
} as const

export const MORE_TEXT = {
  title: 'Más',
  account: 'CUENTA',
  agroconecta: 'AGROCONECTA',
  legal: 'LEGAL',
  editCv: 'Editar perfil profesional',
  notifications: 'Notificaciones',
  following: 'Cuentas seguidas',
  library: 'Biblioteca',
  publish: 'Publicar',
  join: 'Sumate a Agroconecta',
  allies: 'Aliados',
  about: 'Nosotros',
  contact: 'Contacto',
  terms: 'Términos y condiciones',
  privacy: 'Política de privacidad',
  logout: 'Cerrar sesión',
  deleteAccount: 'Eliminar cuenta',
  logoutTitle: 'Cerrar sesión',
  logoutBody: '¿Seguro que querés salir de tu cuenta?',
  logoutConfirm: 'Salir',
  cancel: 'Cancelar',
} as const

export const EDIT_CV_TEXT = {
  title: 'Editar perfil',
  save: 'Guardar',
  saving: 'Guardando…',
  saved: 'Perfil actualizado',
  savedWithPoints: (pts: number) => `Perfil completo: sumaste ${pts} pts`,
  error: 'No pudimos guardar tu perfil. Probá de nuevo.',
  basics: 'Nombre, profesión y departamento',
  sectionPro: 'PERFIL PROFESIONAL',
  sectionExp: 'EXPERIENCIA',
  sectionSocial: 'REDES SOCIALES',
  headline: 'Cargo',
  headlineHint: 'Ej.: Ingeniero agrónomo',
  currentOrg: 'Dónde trabajás',
  currentOrgHint: 'Ej.: Cooperativa Colonias Unidas',
  education: 'Formación',
  educationHint: 'Ej.: Ing. Agronómica — UNA',
  country: 'País',
  bio: 'Sobre mí',
  bioHint: 'Contá en pocas líneas a qué te dedicás.',
  specialties: 'Especialidades',
  specialtiesHint: 'Separadas por coma: soja, manejo de suelos, drones',
  expRole: 'Cargo',
  expOrg: 'Empresa u organización',
  expPeriod: 'Período (ej.: 2019 – hoy)',
  expAdd: 'Agregar experiencia',
  expRemove: 'Quitar',
  socialHint: 'Usuario o enlace',
  sectionPublic: 'PERFIL PÚBLICO',
  publicToggle: 'Cualquiera con el enlace puede ver mi perfil',
  slug: 'Tu dirección',
  slugHint: 'ej.: juan-perez',
  slugTaken: 'Esa dirección ya está en uso. Probá con otra.',
  slugInvalid: 'La dirección tiene que tener entre 3 y 40 letras, números o guiones.',
  back: 'Volver',
} as const

export const POINTS_TEXT = {
  pts: (n: number) => `${n.toLocaleString('es-PY')} pts`,
  earned: (n: number) => `+${n} pts ganados`,
  plus: (n: number) => `+${n} pts`,
  pillA11y: (n: number) => `Mis puntos: ${n}`,
  cardTitle: 'Puntos Agroconecta',
  cardBody: 'Encuestas y quizzes suman puntos',
  redeem: 'Canjear',
  toastEarned: (n: number) => `¡Listo! +${n} puntos`,
  notVerified: 'Verificá tu email para sumar puntos',
} as const

export const POLL_TEXT = {
  label: 'ENCUESTA',
  tapToVote: 'Tocá una opción para votar',
  votes: (n: number) => `${n.toLocaleString('es-PY')} votos · Gracias por participar`,
  error: 'No pudimos registrar tu voto. Probá de nuevo.',
} as const

export const QUIZ_TEXT = {
  label: 'QUIZ AGRO',
  step: (i: number, total: number) => `${i} DE ${total}`,
  complete: 'COMPLETO',
  perCorrect: (n: number) => `+${n} pts por acierto`,
  correct: 'Correcta',
  yours: 'Tu respuesta',
  next: 'Siguiente pregunta',
  result: 'Ver resultado',
  score: (ok: number, total: number) => `${ok} de ${total} correctas`,
  earned: (pts: number) => `Sumaste ${pts} puntos a tu perfil`,
  none: 'Esta vez no sumaste, ¡mañana hay otro quiz!',
  toastWrong: 'Casi. Te marcamos la correcta',
  redeem: 'Ver qué puedo canjear',
  error: 'No pudimos registrar tu respuesta. Probá de nuevo.',
} as const

export const ONBOARDING_TEXT = {
  next: 'Siguiente',
  skip: 'Saltar',
  back: 'Volver',
  finish: 'Empezar a usar Agroconecta',
  start: 'Empezar',
  stepOf: (step: number, total: number) => `Paso ${step} de ${total}`,
  finishing: 'Preparando tu feed…',
  welcomeTitle: 'Bienvenido a Agroconecta',
  welcomeBody: 'El feed del agro paraguayo, hecho a tu medida.',
  welcomeItems: [
    { icon: 'phone-portrait-outline', title: 'Un contenido por pantalla', body: 'Deslizá hacia arriba: noticias, remates, cursos y más.' },
    { icon: 'sparkles-outline', title: 'Karai te responde', body: 'Preguntale lo que necesites saber del agro.' },
    { icon: 'star-outline', title: 'Sumá puntos', body: 'Respondé encuestas y quizzes y canjealos por cursos y eventos.' },
  ],
  nameTitle: '¿Cómo te llamás?',
  nameLabel: 'Nombre y apellido',
  rubrosTitle: '¿En qué rubros estás?',
  rubrosBody: 'Elegí uno o más. Así tu feed arranca con lo que te importa.',
  productionTitle: '¿Qué producís o te interesa?',
  productionBody: 'Opcional. Nos ayuda a mostrarte lo más relevante.',
  professionTitle: '¿A qué te dedicás?',
  scaleTitle: '¿Cómo te describís mejor?',
  scaleBody: 'Opcional.',
  departmentTitle: '¿En qué departamento estás?',
  departmentBody: 'Para mostrarte eventos y noticias cercanas.',
  goalsTitle: '¿Para qué usás Agroconecta?',
  goalsBody: 'Elegí todo lo que aplique.',
  orgsTitle: 'Seguí a quienes te interesan',
  orgsBody: 'Te recomendamos seguir al menos 3 organizaciones o medios.',
  notifTitle: 'Enterate a tiempo',
  notifBody: 'Te avisamos cuando empieza un remate que seguís, sale una noticia importante o cambian los precios.',
  notifCta: 'Activar notificaciones',
  notifOn: 'Notificaciones activadas',
  notifCategories: { breakingNews: 'Noticias importantes', priceAlerts: 'Alertas de precios', weatherAlerts: 'Alertas de clima', institutionalUpdates: 'Novedades institucionales' },
  phoneTitle: 'Tu WhatsApp',
  phoneBody: 'Opcional. Más adelante vas a poder recibir alertas y hablar con Karai por WhatsApp.',
  phoneLabel: 'Número de WhatsApp',
  consentTitle: 'Último paso',
  consentTerms: 'Acepto los términos y condiciones y la política de privacidad.',
  consentPoints: 'Quiero participar del programa de puntos. Soy mayor de 18 años, vivo en Paraguay y acepto su reglamento.',
  readTerms: 'Leer términos',
  readPrivacy: 'Leer privacidad',
  readRules: 'Leer reglamento',
} as const

export const KARAI_TEXT = {
  name: 'Karai',
  title: '¿Qué necesitás saber del agro?',
  newChat: 'Nueva consulta',
  suggestions: ['¿Qué pasó hoy en el agro?', 'Eventos esta semana', 'Mostrame cursos disponibles', 'Noticias sobre ganadería'],
  placeholder: 'Preguntale a Karai…',
  send: 'Enviar',
  typing: 'Karai está escribiendo',
  campoEyebrow: 'KARAI CAMPO',
  campoTitle: 'Administrá tu establecimiento con ayuda de inteligencia artificial.',
  campoCta: 'Conocer KARAI Campo',
  campoMemberTitle: 'Tenés KARAI Campo. Mantené Mi campo al día para respuestas a tu medida.',
  campoMemberCta: 'Ir a Mi campo',
  quota: (left: number) => (left === 1 ? 'Te queda 1 consulta hoy' : `Te quedan ${left} consultas hoy`),
  error: 'No pudimos conectar con Karai. Probá de nuevo en un momento.',
  membersOnlyCta: 'Ver cómo sumarme',
  guestTitle: 'Preguntale a Karai',
  guestBody: 'Iniciá sesión para consultar precios, eventos y todo lo que necesites saber del agro.',
} as const

export const AD_TEXT = {
  chip: 'PATROCINADO',
  defaultCta: 'Ver promoción',
  why: '¿Por qué lo veo?',
  whyTitle: 'Publicidad',
  whyBody: 'Ves este anuncio porque coincide con tu profesión, tu departamento o tus intereses. Los anuncios siempre están marcados como "Patrocinado".',
  whyOk: 'Entendido',
  hide: 'No me interesa',
  hidden: 'No vas a ver más este anuncio',
  pautar: '¿Querés pautar tu contenido acá?',
  learnMore: 'Conocer más',
  leadLabel: 'Publicidad en Agroconecta',
  leadTitle: 'Pautá en Agroconecta',
  leadBody: 'Llegá a productores, técnicos y empresas del agro paraguayo con contenido en el feed y dentro de las noticias. Dejanos tu contacto y te escribimos.',
  back: 'Volver',
} as const

export const LIVE_TEXT = {
  chip: 'EN VIVO',
  now: 'EN VIVO AHORA',
  watch: 'Ver en vivo',
  notInterested: 'No me interesa',
  close: 'Cerrar aviso',
  expand: 'Ver más del aviso',
  collapse: 'Plegar aviso',
  see: 'Ver',
  showHome: 'Mostrar en Inicio',
} as const

export const REWARDS_TEXT = {
  title: 'Canjear puntos',
  back: 'Volver',
  balance: 'Tu saldo',
  nextGoal: (missing: number, title: string) => `Te faltan ${missing.toLocaleString('es-PY')} pts para: ${title}`,
  allUnlocked: 'Podés canjear todo el catálogo',
  catalog: 'CURSOS Y EVENTOS',
  mine: 'MIS CANJES',
  howTo: 'CÓMO SUMAR PUNTOS',
  history: 'HISTORIAL',
  redeem: 'Canjear',
  missing: (n: number) => `Faltan ${n.toLocaleString('es-PY')}`,
  outOfStock: 'Sin cupos',
  confirmTitle: 'Confirmar canje',
  confirmBody: (title: string, cost: number) => `Vas a usar ${cost.toLocaleString('es-PY')} pts en "${title}".`,
  confirm: 'Canjear',
  cancel: 'Cancelar',
  done: (code: string) => `¡Listo! Tu código es ${code}`,
  copied: 'Código copiado',
  copy: 'Copiar código',
  errors: {
    unavailable: 'Este premio ya no está disponible.',
    out_of_stock: 'Se agotaron los cupos de este premio.',
    insufficient: 'Todavía no te alcanzan los puntos.',
    network: 'No pudimos hacer el canje. Probá de nuevo.',
  },
  status: { emitido: 'Para usar', usado: 'Usado', vencido: 'Vencido', anulado: 'Anulado' },
  expires: (date: string) => `Vence el ${date}`,
  rules: 'Ver reglamento de puntos',
  rulesNote: 'Los puntos vencen si pasan 12 meses sin que sumes ni canjees, y cada código vale 60 días.',
  kind: { curso: 'CURSO', evento: 'EVENTO', charla: 'CHARLA' },
  emptyCatalog: 'Pronto vas a poder canjear tus puntos por cursos y entradas a eventos de nuestros aliados.',
  emptyMine: 'Todavía no canjeaste nada.',
  emptyHistory: 'Todavía no tenés movimientos.',
  ways: ['Respondé la encuesta del día: +10 pts', 'Acertá en los quizzes: +10 pts por respuesta', 'Completá tu perfil profesional: +30 pts'],
} as const

/** 1284 → "1.284"; 12400 → "12,4 mil" (mismo formato que el prototipo). */
export function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace('.', ',')} mil`
  return n.toLocaleString('es-PY')
}

export const SHARED_TEXT = {
  notFound: 'No encontramos esta publicación. Puede que ya no esté disponible.',
  goHome: 'Ir al inicio',
} as const

export const CONTACT_TEXT = {
  back: 'Volver',
  eyebrow: 'HABLEMOS',
  title: '¿En qué te podemos ayudar?',
  body: 'Publicidad, alianzas, servicios o una idea para el agro: escribinos y te respondemos personalmente.',
  whatsapp: 'Escribinos por WhatsApp',
  whatsappHint: 'Respondemos en horario de oficina',
  formTitle: 'O dejanos tu número y te llamamos',
  reasons: ['Publicidad', 'Ser aliado', 'Servicios', 'Otra consulta'],
  phone: 'Tu teléfono',
  phoneHint: '+595 9xx xxx xxx',
  message: 'Contanos un poco (opcional)',
  messageHint: 'Qué necesitás, para cuándo…',
  send: 'Enviar',
  sending: 'Enviando…',
  sentTitle: '¡Listo, te contactamos pronto!',
  sentBody: 'Recibimos tu mensaje y te escribimos al número que nos dejaste.',
  again: 'Enviar otro',
  follow: 'SEGUINOS',
  card: {
    title: '¿Querés trabajar con Agroconecta?',
    body: 'Publicidad, alianzas y servicios para el agro. Hablemos.',
    whatsapp: 'WhatsApp',
    more: 'Más opciones',
  },
} as const

export const BASICS_TEXT = {
  title: 'Tus datos',
  name: 'NOMBRE',
  namePlaceholder: 'Tu nombre',
  profession: 'PROFESIÓN',
  department: 'DEPARTAMENTO',
  save: 'Guardar cambios',
} as const

export const NOTIF_TEXT = {
  title: 'Notificaciones',
  subtitle: 'Elegí qué avisos querés recibir en este teléfono.',
  rows: {
    breakingNews: { label: 'Último momento', hint: 'Noticias importantes del agro' },
    priceAlerts: { label: 'Precios', hint: 'Cambios en el mercado' },
    weatherAlerts: { label: 'Clima', hint: 'Alertas que afectan al campo' },
    institutionalUpdates: { label: 'Avisos institucionales', hint: 'Gremios y organizaciones que seguís' },
  },
  reminders: 'Los recordatorios de eventos y remates llegan siempre que los actives en cada uno.',
} as const

export const FOLLOWING_TEXT = {
  title: 'Cuentas seguidas',
  count: (n: number) => (n === 0 ? 'Seguí medios y gremios para ver más de ellos en tu feed.' : `Seguís ${n} cuenta${n === 1 ? '' : 's'}. Lo que publican aparece más en tu feed.`),
  search: 'Buscar medio u organización',
  clear: 'Borrar búsqueda',
  empty: 'No encontramos cuentas con ese nombre.',
  follow: 'Seguir',
  following: 'Siguiendo',
  category: { media: 'Medio', asociacion: 'Asociación', institucion: 'Institución', gremio: 'Gremio', rematadora: 'Rematadora' },
} as const

export const LIBRARY_TEXT = {
  title: 'Biblioteca',
  subtitle: 'Libros, guías y manuales del agro para leer y guardar.',
  search: 'Buscar título o autor',
  clear: 'Borrar búsqueda',
  collections: 'MIS COLECCIONES',
  emptyCollections: 'Guardá libros para tenerlos siempre a mano.',
  empty: 'Todavía no hay títulos cargados.',
  noResults: (q: string) => `Sin resultados para "${q}"`,
} as const

export const BOOK_TEXT = {
  read: 'Leer',
  opening: 'Abriendo…',
  openError: 'No pudimos abrir el archivo. Probá de nuevo.',
  saved: 'Guardado en Mis colecciones',
  removed: 'Quitado de Mis colecciones',
  saveA11y: 'Guardar en Mis colecciones',
  removeA11y: 'Quitar de Mis colecciones',
  pages: (n: number) => `${n} páginas`,
  notFound: 'No encontramos este título.',
  back: 'Volver',
  close: 'Cerrar lector',
} as const

export const ALLIES_TEXT = {
  title: 'Aliados',
  subtitle: 'Empresas e instituciones que hacen posible Agroconecta.',
  search: 'Buscar aliado',
  clear: 'Borrar búsqueda',
  all: 'Todos',
  none: 'Todavía no hay aliados.',
  noResults: (q: string) => (q ? `Sin resultados para "${q}"` : 'No hay aliados en esta categoría.'),
  whatsapp: (name: string) => `Escribir a ${name} por WhatsApp`,
} as const

export const KARAI_HISTORY_TEXT = {
  title: 'Tus consultas',
  subtitle: 'Tocá una para seguir la conversación.',
  empty: 'Todavía no hiciste consultas a Karai.',
  error: 'No pudimos cargar tus consultas. Probá de nuevo.',
  today: 'Hoy',
  yesterday: 'Ayer',
  delete: 'Borrar',
  deleteTitle: '¿Borrar esta consulta?',
  deleteBody: 'Se borra la conversación completa. No se puede deshacer.',
  cancel: 'Cancelar',
  history: 'Historial de consultas',
  farm: 'Mi campo',
} as const

export const MI_CAMPO_TEXT = {
  title: 'Mi campo',
  subtitle: 'Contale a Karai cómo es tu establecimiento para que te responda a tu medida.',
  privacy: 'Estos datos se usan únicamente para que Karai te responda mejor. No se muestran a nadie, no se venden y no se usan para publicidad. Los podés cambiar o borrar cuando quieras.',
  name: 'NOMBRE DEL ESTABLECIMIENTO',
  namePlaceholder: 'Estancia San José',
  district: 'DISTRITO',
  districtPlaceholder: 'Ej.: Concepción',
  hectares: 'HECTÁREAS TOTALES',
  hectaresPlaceholder: 'Ej.: 250',
  animals: 'Ganado y animales',
  animalType: 'Ej.: Vacas de cría',
  animalCount: 'Cabezas',
  addAnimal: 'Agregar animales',
  crops: 'Cultivos',
  cropType: 'Ej.: Soja',
  cropHa: 'Hectáreas',
  addCrop: 'Agregar cultivo',
  notes: 'Algo más que Karai deba saber',
  notesPlaceholder: 'Sistema de producción, pasturas, maquinaria…',
  save: 'Guardar Mi campo',
  saving: 'Guardando…',
  saved: 'Listo: Karai ya conoce tu campo',
  error: 'No pudimos guardar. Probá de nuevo.',
  invite: 'Completá Mi campo para que Karai te responda según tu establecimiento.',
  inviteCta: 'Completar Mi campo',
} as const

export const KARAI_CAMPO_TEXT = {
  eyebrow: 'KARAI CAMPO',
  title: 'Karai, a la medida de tu establecimiento',
  body: 'La versión completa de Karai para productores: conoce tu campo y te responde con tus números.',
  memberBody: 'Ya tenés KARAI Campo. Mantené Mi campo al día para que Karai te responda con tus datos.',
  benefits: [
    { icon: 'leaf-outline', title: 'Mi campo', body: 'Karai conoce tus hectáreas, tu ganado y tus cultivos, y los tiene en cuenta en cada respuesta.' },
    { icon: 'chatbubbles-outline', title: 'Más consultas por día', body: 'Hasta 15 consultas diarias para planificar sin quedarte corto.' },
    { icon: 'ribbon-outline', title: 'Miembro de Agroconecta', body: 'Beneficios especiales para miembros, que vamos a ir sumando.' },
  ] as { icon: 'leaf-outline' | 'chatbubbles-outline' | 'ribbon-outline'; title: string; body: string }[],
  goFarm: 'Ir a Mi campo',
  interested: '¿Te interesa para tu establecimiento? Nuestro equipo te cuenta todo.',
  talk: 'Hablar con Agroconecta',
} as const

export const PUBLISH_TEXT = {
  title: 'Publicar',
  subtitle: 'Compartí una noticia o un video de tu organización con todo el agro.',
  org: 'ORGANIZACIÓN',
  type: 'QUÉ VAS A PUBLICAR',
  types: [
    { value: 'article', label: 'Noticia' },
    { value: 'video', label: 'Video' },
  ],
  rubro: 'RUBRO',
  titlePlaceholder: 'Título',
  summaryPlaceholder: 'Bajada: de qué se trata, en una o dos líneas',
  contentPlaceholder: 'Texto completo (opcional)',
  youtubePlaceholder: 'Link de YouTube del video',
  image: 'Agregar imagen',
  imageHint: 'Horizontal, se ve arriba de la publicación',
  review: 'Antes de salir en la app, nuestro equipo la revisa. Te avisamos si hace falta cambiar algo.',
  send: 'Enviar a revisión',
  sending: 'Enviando…',
  error: 'No pudimos enviar la publicación. Probá de nuevo.',
  sentTitle: '¡Recibimos tu publicación!',
  sentBody: 'La revisamos y, apenas la aprobemos, aparece en el feed de Agroconecta.',
  back: 'Volver',
} as const

export const PUBLISH_INFO_TEXT = {
  title: 'Publicá en Agroconecta',
  subtitle: 'Para organizaciones, gremios, medios y empresas del agro.',
  points: [
    { icon: 'newspaper-outline', title: 'Tus noticias y videos en el feed', body: 'Llegá a productores y profesionales según su rubro y departamento.' },
    { icon: 'people-outline', title: 'Seguidores propios', body: 'La gente sigue a tu organización y ve más de lo que publicás.' },
    { icon: 'stats-chart-outline', title: 'Resultados', body: 'Sabé cuántas personas vieron y guardaron tus publicaciones.' },
  ] as { icon: 'newspaper-outline' | 'people-outline' | 'stats-chart-outline'; title: string; body: string }[],
  cta: 'Quiero publicar',
  already: 'Si tu organización ya tiene el plan y no ves el formulario, escribinos y te habilitamos.',
} as const

export type PlanChoice = 'free' | 'karai_campo' | 'organizacion'

export const PLAN_TEXT = {
  title: '¿Cómo querés usar Agroconecta?',
  body: 'Podés empezar gratis y cambiar cuando quieras.',
  plans: [
    {
      value: 'free',
      title: 'Gratis',
      for: 'Para estar al día con el agro.',
      features: ['Feed de noticias, eventos, precios y videos', 'Karai: 5 consultas por día', 'Puntos y canjes'],
    },
    {
      value: 'karai_campo',
      title: 'KARAI Campo',
      for: 'Para productores que quieren a Karai trabajando con sus datos.',
      features: ['Todo lo gratis', 'Mi campo: Karai conoce tu establecimiento', 'Hasta 15 consultas por día', 'Beneficios de miembro de Agroconecta'],
    },
    {
      value: 'organizacion',
      title: 'Organizaciones',
      for: 'Para gremios, medios, empresas e instituciones.',
      features: ['Publicá noticias y videos en el feed', 'Seguidores propios y resultados', 'Tu perfil de organización'],
    },
  ] as { value: PlanChoice; title: string; for: string; features: string[] }[],
  note: 'Si elegís un plan, nuestro equipo te contacta para contarte cómo activarlo.',
} as const

export const SERVICE_TEXT = {
  notFound: 'Servicio no encontrado',
  whatsapp: 'Consultar por WhatsApp',
  formTitle: 'O dejanos tu número y te llamamos',
  phone: 'Tu teléfono',
  info: 'Contanos qué necesitás (opcional)',
  send: 'Pedir que me contacten',
  sending: 'Enviando…',
  sentTitle: '¡Listo!',
  sentBody: 'Te contactamos al número que nos dejaste.',
  section: 'SERVICIOS DE AGROCONECTA',
} as const
