import type { FeedCandidate, FeedContentType } from './types'

// Búsqueda, filtros y tendencias de Explorar (README §3.3). Funciones puras sobre los mismos
// candidatos del feed, así Explorar y el feed muestran exactamente el mismo contenido.

export const EXPLORE_TYPES: FeedContentType[] = ['noticia', 'evento', 'video', 'curso', 'producto', 'servicio', 'empleo', 'remate']
export const EXPLORE_RUBROS = ['agricultura', 'ganaderia', 'horticultura', 'tecnologia', 'mercados'] as const

const TRENDING_WINDOW_DAYS = 14
const TRENDING_COUNT = 4
const MIN_WORD_LENGTH = 2

/** "Ganadería" → "ganaderia": búsqueda sin tildes ni mayúsculas. */
export function normalizeText(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export interface ExploreFilters {
  query: string
  type: FeedContentType | null
  rubro: string | null
}

/** Todas las palabras de la búsqueda tienen que aparecer en título, bajada, organización o etiquetas. */
export function matchesQuery(c: FeedCandidate, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter((w) => w.length >= MIN_WORD_LENGTH)
  if (words.length === 0) return true
  const haystack = normalizeText([c.title, c.summary, c.organizationName, ...c.tags].join(' '))
  return words.every((w) => haystack.includes(w))
}

export function filterCandidates(candidates: FeedCandidate[], f: ExploreFilters): FeedCandidate[] {
  return candidates.filter(
    (c) => (!f.type || c.contentType === f.type) && (!f.rubro || c.tags.includes(f.rubro)) && matchesQuery(c, f.query),
  )
}

export interface TrendingTag {
  tag: string
  count: number
}

/** Las etiquetas más usadas en lo publicado en las últimas 2 semanas. */
export function trendingTags(candidates: FeedCandidate[], now: Date): TrendingTag[] {
  const since = now.getTime() - TRENDING_WINDOW_DAYS * 86_400_000
  const counts = new Map<string, number>()
  for (const c of candidates) {
    if (new Date(c.publishedAt).getTime() < since) continue
    for (const tag of c.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TRENDING_COUNT)
    .map(([tag, count]) => ({ tag, count }))
}

// Palabras que no aportan para buscar contenido relacionado a una pregunta en lenguaje natural.
const STOPWORDS = new Set(
  'hola como cual cuales cuando donde quien quienes que para por con sin una uno unos unas los las del desde hasta sobre entre este esta estos estas ese esa esos esas hay tiene tienen tengo quiero puedo saber precio precios esta semana hoy mañana mas muy bien algo alguna algun'.split(' '),
)
const MIN_KEYWORD_LENGTH = 4
const REFS_LIMIT = 3

/**
 * Contenido de Agroconecta relacionado a un mensaje de Karai (las tarjetas que se pueden abrir dentro
 * de la respuesta). A diferencia de la búsqueda de Explorar no exige todas las palabras: gana lo que
 * más palabras clave comparte, con el título pesando el doble.
 */
export function searchRefs(candidates: FeedCandidate[], message: string, limit = REFS_LIMIT): FeedCandidate[] {
  const keywords = [...new Set(normalizeText(message).split(/[^a-z0-9ñ]+/))].filter(
    (w) => w.length >= MIN_KEYWORD_LENGTH && !STOPWORDS.has(w),
  )
  if (keywords.length === 0) return []
  return candidates
    .map((c) => {
      const title = normalizeText(c.title)
      const rest = normalizeText([c.summary, c.organizationName, ...c.tags].join(' '))
      const score = keywords.reduce((acc, w) => acc + (title.includes(w) ? 2 : rest.includes(w) ? 1 : 0), 0)
      return { c, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.c.publishedAt.localeCompare(a.c.publishedAt))
    .slice(0, limit)
    .map((x) => x.c)
}
