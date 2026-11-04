// Búsqueda liviana para el contexto de Karai (sin embeddings todavía; el paso siguiente es Cloudflare AI Search,
// docs/KARAI-CAMPO-PLAN.md). Antes el modelo veía siempre las últimas 5 noticias y las últimas 10 fuentes, sin
// importar la pregunta: si preguntabas por sésamo y la nota de sésamo era de hace un mes, no la veía nunca.
// Funciones puras para poder testearlas sin Supabase.

const STOPWORDS = new Set(
  'para como cual cuales cuando donde desde hasta entre sobre esta este estos estas esos esas aquel tiene tienen tengo hacer hace puedo podes quiero queres sabes saber decime dame cuanto cuanta cuantos cuantas porque pero tambien mucho mucha muchos poco algo nada todo todos todas ahora hoy semana mes dias noticias noticia hay que con sin los las del una unos unas mas menos muy bien buen buena dia tal hola gracias karai'.split(' '),
)

/** Sinónimos y variantes comunes del agro paraguayo: amplían la búsqueda sin depender de la palabra exacta. */
const EXPANSIONS: Record<string, string[]> = {
  novillo: ['ganado', 'hacienda', 'carne'],
  vaca: ['ganado', 'bovino', 'leche'],
  ganado: ['hacienda', 'bovino', 'carne'],
  carne: ['frigorifico', 'exportacion', 'ganado'],
  soja: ['granos', 'oleaginosa'],
  maiz: ['granos', 'cereal'],
  trigo: ['granos', 'cereal'],
  leche: ['lechero', 'tambo'],
  tambo: ['leche', 'lechero'],
  remate: ['feria', 'subasta'],
  clima: ['lluvia', 'sequia', 'pronostico', 'temperatura'],
  lluvia: ['clima', 'pronostico'],
  precio: ['precios', 'cotizacion', 'mercado'],
  dolar: ['cotizacion', 'cambio'],
  garrapata: ['sanidad', 'parasitos'],
  aftosa: ['sanidad', 'senacsa', 'vacunacion'],
  plaga: ['sanidad', 'control', 'senave'],
  credito: ['financiamiento', 'prestamo', 'banco'],
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Palabras con peso de una pregunta (sin acentos, sin palabras vacías) más sus variantes del agro. */
export function queryTerms(message: string): string[] {
  const words = normalize(message)
    .split(/[^a-z0-9ñ]+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
  const singular = words.map((w) => (w.length > 5 && w.endsWith('es') ? w.slice(0, -2) : w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w))
  const expanded = singular.flatMap((w) => [w, ...(EXPANSIONS[w] ?? [])])
  return [...new Set(expanded)]
}

/** Cuántos términos aparecen en el texto (cada término cuenta una vez; los del título valen el doble). */
export function relevance(terms: string[], title: string, body = ''): number {
  if (terms.length === 0) return 0
  const t = normalize(title)
  const b = normalize(body)
  let score = 0
  for (const term of terms) {
    if (t.includes(term)) score += 2
    else if (b.includes(term)) score += 1
  }
  return score
}

/** Los `limit` más relevantes con al menos un término; a igualdad, el que vino primero (el más nuevo). */
export function pickRelevant<T>(items: T[], terms: string[], text: (item: T) => [string, string?], limit: number): T[] {
  return items
    .map((item, index) => ({ item, index, score: relevance(terms, ...text(item)) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((x) => x.item)
}

const DAY = 86_400_000

/** "hoy", "ayer", "hace 5 días", "hace 3 semanas", "hace 4 meses", "hace más de un año" — para que el modelo sepa qué tan viejo es cada dato. */
export function ageLabel(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY)
  if (days <= 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 14) return `hace ${days} días`
  if (days < 60) return `hace ${Math.round(days / 7)} semanas`
  if (days < 365) return `hace ${Math.round(days / 30)} meses`
  return 'hace más de un año'
}

/** Fecha corta en hora de Paraguay: "3 nov 2026". */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PY', { timeZone: 'America/Asuncion', day: 'numeric', month: 'short', year: 'numeric' })
}

/** Junta dos listas sin repetir (por clave), respetando el orden: primero `first`. */
export function mergeUnique<T>(first: T[], second: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  return [...first, ...second].filter((item) => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
