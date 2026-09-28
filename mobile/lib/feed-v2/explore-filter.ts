import type { ExploreFilters, FeedContentItem } from './types'

// Mismo criterio que web/lib/feed/explore.ts (filterCandidates + sortByStart), aplicado en el teléfono
// sobre el catálogo completo: así filtrar es instantáneo y no cambia de resultados mientras llega la red.

const MIN_WORD_LENGTH = 2

/** "Ganadería" → "ganaderia": búsqueda sin tildes ni mayúsculas. */
function normalizeText(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function matchesQuery(item: FeedContentItem, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter((w) => w.length >= MIN_WORD_LENGTH)
  if (words.length === 0) return true
  const haystack = normalizeText([item.title, item.summary, item.organizationName, ...item.tags].join(' '))
  return words.every((w) => haystack.includes(w))
}

export function filterExplore(catalog: FeedContentItem[], f: ExploreFilters): FeedContentItem[] {
  const matches = catalog.filter(
    (i) => (!f.type || i.contentType === f.type) && (!f.rubro || i.tags.includes(f.rubro)) && matchesQuery(i, f.query),
  )
  // Eventos y remates: del más cercano al más lejano.
  if (f.type === 'evento' || f.type === 'remate') {
    return [...matches].sort((a, b) => (a.startsAt ?? '9999').localeCompare(b.startsAt ?? '9999'))
  }
  return matches
}
