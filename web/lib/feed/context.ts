import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { loadEventCandidates, loadListingCandidates, loadPostCandidates } from './candidates'
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

export async function loadRankingContext(admin: SupabaseClient, userId: string, asOf: Date): Promise<RankingContext> {
  const [posts, listings, events, state, weights, engagement] = await Promise.all([
    loadPostCandidates(admin, asOf),
    loadListingCandidates(admin, asOf),
    loadEventCandidates(createEventsClient(), asOf),
    loadUserFeedState(admin, userId, asOf),
    loadWeights(admin),
    loadEngagement(admin, asOf),
  ])
  return { candidates: [...posts, ...listings, ...events], state, weights, engagement }
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
