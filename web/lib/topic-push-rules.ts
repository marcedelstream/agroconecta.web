// Reglas puras de los avisos por tema (sin base de datos, para poder testearlas). Ver lib/topic-push.ts.

export interface FacetRow {
  user_id: string
  value: string
}

/**
 * A quién avisar: quien eligió alguna de las etiquetas del contenido, no lo desactivó en "Novedades de tus
 * temas" (sin preferencia guardada = activado, igual que en la app) y todavía no recibió un aviso por tema hoy.
 */
export function pickTopicRecipients(
  tags: string[],
  facets: FacetRow[],
  prefs: Map<string, Record<string, boolean> | null>,
  alreadyToday: Set<string>,
): string[] {
  const wanted = new Set(tags)
  const users = new Set(facets.filter((f) => wanted.has(f.value)).map((f) => f.user_id))
  return [...users].filter((u) => prefs.get(u)?.topicAlerts !== false && !alreadyToday.has(u))
}

/** Título del aviso: la etiqueta que coincide, legible. "Novedad de Sésamo", o "Novedades de Sésamo y Chía". */
export function topicTitle(labels: string[]): string {
  const shown = labels.slice(0, 2)
  if (shown.length === 0) return 'Novedad de tus temas'
  return shown.length === 1 ? `Novedad de ${shown[0]}` : `Novedades de ${shown[0]} y ${shown[1]}`
}

/** Qué abre la app al tocar el aviso (app/_layout.tsx ya entiende estas claves). */
export function topicPushData(contentKey: string): Record<string, string> {
  const [source, ...rest] = contentKey.split(':')
  const id = rest.join(':')
  if (source === 'post') return { articleId: id }
  if (source === 'event') return { eventSlug: id }
  if (source === 'listing') return { listingId: id }
  return {}
}
