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
}

/** Tipos que usan el botón de acción: los de contenido + la tarjeta "Tu mercado hoy". */
export type CtaKind = FeedContentType | 'precios'

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
  precios: 'Ver todos los precios',
}

export const FEED_TEXT = {
  brand: 'Agroconecta',
  search: 'Buscar',
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
  back: 'Volver',
} as const

/** 1284 → "1.284"; 12400 → "12,4 mil" (mismo formato que el prototipo). */
export function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace('.', ',')} mil`
  return n.toLocaleString('es-PY')
}
