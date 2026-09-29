import type { FeedContentType } from './types'

// Textos de tipos y rubros para la web pública (espejo de mobile/lib/feed-v2/labels.ts).

export const TYPE_LABEL: Record<FeedContentType, string> = {
  noticia: 'Noticia',
  video: 'Video',
  evento: 'Evento',
  curso: 'Curso',
  producto: 'Producto',
  servicio: 'Servicio',
  empleo: 'Empleo',
  remate: 'Remate',
  libro: 'Libro',
}

/** Orden y nombre de las pestañas de Explorar. */
export const TYPE_TABS: { value: FeedContentType; label: string }[] = [
  { value: 'evento', label: 'Eventos' },
  { value: 'noticia', label: 'Noticias' },
  { value: 'curso', label: 'Cursos' },
  { value: 'empleo', label: 'Empleos' },
  { value: 'remate', label: 'Remates' },
  { value: 'producto', label: 'Productos' },
  { value: 'servicio', label: 'Servicios' },
  { value: 'video', label: 'Videos' },
  { value: 'libro', label: 'Biblioteca' },
]

export const RUBRO_LABEL: Record<string, string> = {
  agricultura: 'Agricultura',
  ganaderia: 'Ganadería',
  horticultura: 'Horticultura',
  tecnologia: 'Tecnología',
  mercados: 'Mercados',
}

/** Link público de cada publicación: la página que invita a abrirla en la app. */
export function itemPath(c: { source: string; sourceId: string }): string {
  return `/p/${c.source}/${encodeURIComponent(c.sourceId)}`
}
