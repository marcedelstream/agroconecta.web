import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { attachContentTags } from '@/lib/content-tags'
import { loadEventCandidates, loadLibraryCandidates, loadListingCandidates, loadPostCandidates } from './candidates'
import { loadEngagement, loadUserFeedState, loadWeights, type UserFeedState } from './signals'
import type { FeedCandidate, FeedContentItem, FeedEngagement, FeedWeights } from './types'

// Lo que comparten /api/feed y /api/explore: todos los candidatos + las señales del usuario, y el
// armado de cada item con sus contadores y el estado del usuario (me gusta, guardado, sigue).

// Base externa de eventosagropy.com (misma que usa lib/karai/events-context.ts). Sin env vars se
// sigue sin eventos en vez de romperse.
export function createEventsClient(): SupabaseClient | null {
  const url = process.env.EVENTOS_SUPABASE_URL
  const key = process.env.EVENTOS_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface RankingContext {
  candidates: FeedCandidate[]
  state: UserFeedState
  weights: FeedWeights
  engagement: Map<string, FeedEngagement>
}

// Todo lo que es igual para todos se guarda un minuto en memoria: sin esto cada apertura del Inicio o del feed
// repetía unas diez consultas, y además dos bases distintas (segundos de espera en el teléfono).
const SHARED_TTL_MS = 60_000
type SharedData = Pick<RankingContext, 'candidates' | 'weights' | 'engagement'>
let shared: { at: number; data: Promise<SharedData> } | null = null

async function loadShared(admin: SupabaseClient, asOf: Date): Promise<SharedData> {
  const [posts, listings, events, books, weights, engagement] = await Promise.all([
    loadPostCandidates(admin, asOf),
    loadListingCandidates(admin, asOf),
    loadEventCandidates(createEventsClient(), asOf),
    loadLibraryCandidates(admin),
    loadWeights(admin),
    loadEngagement(admin, asOf),
  ])
  const candidates = await attachContentTags(admin, [...posts, ...listings, ...events, ...books])
  return { candidates, weights, engagement }
}

function sharedData(admin: SupabaseClient, asOf: Date): Promise<SharedData> {
  if (shared && Date.now() - shared.at < SHARED_TTL_MS) return shared.data
  const data = loadShared(admin, asOf)
  const entry = { at: Date.now(), data }
  shared = entry
  // Un error no queda guardado: la próxima visita reintenta.
  data.catch(() => {
    if (shared === entry) shared = null
  })
  return data
}

export async function loadRankingContext(admin: SupabaseClient, userId: string | null, asOf: Date): Promise<RankingContext> {
  const [data, state] = await Promise.all([sharedData(admin, asOf), loadUserFeedState(admin, userId, asOf)])
  return { ...data, state }
}

/** Solo necesita el estado del usuario y los contadores (Guardados no carga el resto del contexto). */
export function toContentItem(c: FeedCandidate, ctx: Pick<RankingContext, 'state' | 'engagement'>): FeedContentItem {
  const e = ctx.engagement.get(c.key)
  return {
    ...c,
    kind: 'content',
    likes: e?.likes ?? 0,
    saves: e?.saves ?? 0,
    liked: ctx.state.liked.has(c.key),
    saved: ctx.state.saved.has(c.key),
    following: c.organizationId !== null && ctx.state.signals.followedOrgIds.has(c.organizationId),
  }
}
