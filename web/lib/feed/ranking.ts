import type {
  FeedCandidate,
  FeedContentType,
  FeedEngagement,
  FeedUserSignals,
  FeedWeights,
} from './types'

// Ranking v1 por reglas (BACKEND-Y-DATOS.md §3.2–3.3). Funciones puras: todo lo que depende de la
// hora entra por `now` para que el orden sea reproducible entre páginas y en los tests.

const HOUR_MS = 3_600_000

export const DEFAULT_WEIGHTS: FeedWeights = {
  w_rec: 1.0,
  w_int: 0.8,
  w_geo: 0.5,
  w_prof: 0.3,
  w_fol: 0.7,
  w_eng: 0.6,
  w_evt: 0.6,
  w_seen: 1.2,
  exploration: 0.2,
}

// Vida media en horas. evento/remate con fecha se tratan aparte (valen hasta que pasan).
const HALF_LIFE_HOURS: Record<FeedContentType, number> = {
  noticia: 36,
  video: 7 * 24,
  evento: 7 * 24,
  remate: 7 * 24,
  curso: 14 * 24,
  producto: 14 * 24,
  servicio: 14 * 24,
  empleo: 14 * 24,
  // Los libros no pierden vigencia como una noticia.
  libro: 90 * 24,
}

// Afinidad profesión → tipo de contenido (0–1). Lo que no figura vale NEUTRAL_AFFINITY.
const NEUTRAL_AFFINITY = 0.5
const PROFESSION_AFFINITY: Record<string, Partial<Record<FeedContentType, number>>> = {
  productor: { remate: 1, evento: 0.9, producto: 0.8, servicio: 0.8, noticia: 0.7 },
  veterinario: { curso: 0.9, evento: 0.8, remate: 0.7, empleo: 0.7 },
  agronomo: { curso: 0.9, evento: 0.8, servicio: 0.7, empleo: 0.7 },
  comerciante: { producto: 1, remate: 0.9, servicio: 0.7 },
  transportista: { servicio: 0.9, remate: 0.7, empleo: 0.7 },
  estudiante: { curso: 1, empleo: 1, evento: 0.8 },
  comunicador: { noticia: 1, video: 0.9, evento: 0.8 },
}

// Suavizado bayesiano del engagement: un item nuevo arranca en la media del feed en vez de 0 o 1.
const ENG_PRIOR_RATE = 0.05
const ENG_PRIOR_WEIGHT = 20
const ENG_RATE_CAP = 0.3

export function hoursBetween(fromIso: string, now: Date): number {
  return (now.getTime() - new Date(fromIso).getTime()) / HOUR_MS
}

export function recencyScore(c: FeedCandidate, now: Date): number {
  if (c.startsAt && (c.contentType === 'evento' || c.contentType === 'remate')) {
    return hoursBetween(c.startsAt, now) <= 0 ? 1 : 0
  }
  const age = Math.max(0, hoursBetween(c.publishedAt, now))
  return Math.pow(0.5, age / HALF_LIFE_HOURS[c.contentType])
}

/** Sube desde 72 h antes del evento y llega al máximo el día anterior. */
export function eventProximityScore(c: FeedCandidate, now: Date): number {
  if (!c.startsAt) return 0
  const hoursUntil = -hoursBetween(c.startsAt, now)
  if (hoursUntil < 0 || hoursUntil > 72) return 0
  if (hoursUntil <= 24) return 1
  return (72 - hoursUntil) / 48
}

export function interestMatch(c: FeedCandidate, u: FeedUserSignals): number {
  return c.tags.some((t) => u.interests.includes(t)) ? 1 : 0
}

export function geoMatch(c: FeedCandidate, u: FeedUserSignals): number {
  if (c.targetDepartments.length === 0) return 0.5
  return u.department && c.targetDepartments.includes(u.department) ? 1 : 0
}

export function professionAffinity(c: FeedCandidate, u: FeedUserSignals): number {
  if (!u.profession) return NEUTRAL_AFFINITY
  return PROFESSION_AFFINITY[u.profession]?.[c.contentType] ?? NEUTRAL_AFFINITY
}

export function engagementScore(e: FeedEngagement | undefined): number {
  const interactions = e ? e.likes + e.saves + e.ctaOpens : 0
  const impressions = e?.impressions ?? 0
  const rate = (interactions + ENG_PRIOR_RATE * ENG_PRIOR_WEIGHT) / (impressions + ENG_PRIOR_WEIGHT)
  return Math.min(1, rate / ENG_RATE_CAP)
}

export function seenPenalty(c: FeedCandidate, u: FeedUserSignals): number {
  const state = u.seen.get(c.key)
  if (state === 'skipped') return 2
  return state === 'seen' ? 1 : 0
}

export function scoreCandidate(
  c: FeedCandidate,
  u: FeedUserSignals,
  engagement: FeedEngagement | undefined,
  w: FeedWeights,
  now: Date,
): number {
  return (
    w.w_rec * recencyScore(c, now) +
    w.w_int * interestMatch(c, u) +
    w.w_geo * geoMatch(c, u) +
    w.w_prof * professionAffinity(c, u) +
    w.w_fol * (c.organizationId && u.followedOrgIds.has(c.organizationId) ? 1 : 0) +
    w.w_eng * engagementScore(engagement) +
    w.w_evt * eventProximityScore(c, now) -
    w.w_seen * seenPenalty(c, u)
  )
}

interface Scored {
  candidate: FeedCandidate
  score: number
  inInterest: boolean
}

function conflicts(a: FeedCandidate | undefined, b: FeedCandidate): boolean {
  if (!a) return false
  if (a.contentType === b.contentType) return true
  return a.organizationId !== null && a.organizationId === b.organizationId
}

/**
 * Ordena y mezcla: nunca dos seguidos del mismo tipo u organización (si hay alternativa), y
 * ~`exploration` de los lugares se reserva para contenido fuera de los intereses declarados.
 */
export function rankFeed(
  candidates: FeedCandidate[],
  user: FeedUserSignals,
  engagement: Map<string, FeedEngagement>,
  weights: FeedWeights,
  now: Date,
): FeedCandidate[] {
  const scored: Scored[] = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, user, engagement.get(candidate.key), weights, now),
      inInterest: interestMatch(candidate, user) === 1,
    }))
    .sort((a, b) => b.score - a.score || a.candidate.key.localeCompare(b.candidate.key))

  // Sin intereses declarados todo es "exploración": no tiene sentido reservar lugares.
  const hasInterests = user.interests.length > 0 && scored.some((s) => s.inInterest)
  const exploreEvery = weights.exploration > 0 ? Math.max(2, Math.round(1 / weights.exploration)) : 0

  const remaining = [...scored]
  const result: FeedCandidate[] = []

  while (remaining.length > 0) {
    const position = result.length + 1
    const wantExplore = hasInterests && exploreEvery > 0 && position % exploreEvery === 0
    const prev = result[result.length - 1]

    const pick = (predicate: (s: Scored) => boolean) =>
      remaining.findIndex((s) => predicate(s) && !conflicts(prev, s.candidate))

    let idx = wantExplore ? pick((s) => !s.inInterest) : -1
    if (idx === -1) idx = pick(() => true)
    if (idx === -1) idx = 0

    result.push(remaining.splice(idx, 1)[0].candidate)
  }

  return result
}

/**
 * Manda al final lo que el usuario ya vio en esta sesión, sin cambiar el orden relativo. Lo usa el
 * "tirar para actualizar": la telemetría llega en lotes y el ranking todavía no sabe qué se vio,
 * así que la app manda esas claves y la recarga arranca con contenido nuevo.
 */
export function deprioritizeSeen<T extends { key: string }>(ranked: T[], seenKeys: Set<string>): T[] {
  if (seenKeys.size === 0) return ranked
  return [...ranked.filter((c) => !seenKeys.has(c.key)), ...ranked.filter((c) => seenKeys.has(c.key))]
}

const DATED_TYPES: FeedContentType[] = ['evento', 'remate']
const isDated = (c: FeedCandidate) => DATED_TYPES.includes(c.contentType) && !!c.startsAt

/** Eventos y remates con fecha, del más próximo al más lejano (sin fecha van al final). */
export function sortByStart<T extends FeedCandidate>(items: T[]): T[] {
  const time = (c: T) => (c.startsAt ? new Date(c.startsAt).getTime() : Number.POSITIVE_INFINITY)
  return [...items].sort((a, b) => time(a) - time(b) || a.key.localeCompare(b.key))
}

/**
 * Los eventos y remates conservan los lugares que les dio el ranking, pero los ocupan en orden
 * cronológico: nunca aparece un evento de diciembre antes que uno de esta semana.
 */
export function chronologicalEvents<T extends FeedCandidate>(ranked: T[]): T[] {
  const dated = sortByStart(ranked.filter(isDated))
  let next = 0
  return ranked.map((c) => (isDated(c) ? dated[next++] : c))
}

/** Posición (0-based) de la tarjeta "Tu mercado hoy" en la primera página. */
export const MARKET_CARD_POSITION = 2

/** Cuántas publicaciones de otro tipo tiene que haber entre dos libros, y antes del primero. */
export const BOOK_GAP = 6
export const FIRST_BOOK_POSITION = 3

/**
 * Los libros no pierden vigencia, así que el ranking los deja muy arriba y se amontonan. Acá se
 * reparten: uno cada `gap` publicaciones como mucho; los que sobran pasan más abajo (no se pierden).
 */
export function spaceOut<T extends FeedCandidate>(ranked: T[], type: FeedContentType, gap = BOOK_GAP, first = FIRST_BOOK_POSITION): T[] {
  const out: T[] = []
  const waiting: T[] = []
  let sinceLast = gap - first
  const placeWaiting = () => {
    if (waiting.length > 0 && sinceLast >= gap) {
      out.push(waiting.shift()!)
      sinceLast = 0
    }
  }
  for (const c of ranked) {
    placeWaiting()
    if (c.contentType !== type) {
      out.push(c)
      sinceLast += 1
    } else if (sinceLast >= gap && waiting.length === 0) {
      out.push(c)
      sinceLast = 0
    } else {
      waiting.push(c)
    }
  }
  placeWaiting()
  return [...out, ...waiting]
}
