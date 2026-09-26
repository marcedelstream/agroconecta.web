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
} as const

/** 1284 → "1.284"; 12400 → "12,4 mil" (mismo formato que el prototipo). */
export function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace('.', ',')} mil`
  return n.toLocaleString('es-PY')
}
