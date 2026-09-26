import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { loadEventCandidates, loadListingCandidates, loadPostCandidates } from './candidates'
import { MARKET_CARD_POSITION, rankFeed } from './ranking'
import { loadEngagement, loadUserFeedState, loadWeights } from './signals'
import type { FeedItem, FeedPage } from './types'

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 20

interface Cursor {
  /** Posición en la lista ordenada. */
  o: number
  /** Momento en que se armó la primera página: congela la recencia para que las páginas no se pisen. */
  t: string
}

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c)).toString('base64url')
}

export function decodeCursor(raw: string | null): Cursor | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Partial<Cursor>
    if (typeof parsed.o !== 'number' || parsed.o < 0 || typeof parsed.t !== 'string') return null
    if (Number.isNaN(new Date(parsed.t).getTime())) return null
    return { o: Math.floor(parsed.o), t: parsed.t }
  } catch {
    return null
  }
}

// Base externa de eventosagropy.com (misma que usa lib/karai/events-context.ts). Sin env vars el
// feed sale sin eventos en vez de romperse.
function createEventsClient(): SupabaseClient | null {
  const url = process.env.EVENTOS_SUPABASE_URL
  const key = process.env.EVENTOS_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function buildFeedPage(
  admin: SupabaseClient,
  userId: string,
  cursor: Cursor | null,
  pageSize: number,
): Promise<FeedPage> {
  const asOf = cursor ? new Date(cursor.t) : new Date()
  const offset = cursor?.o ?? 0

  const [posts, listings, events, state, weights, engagement] = await Promise.all([
    loadPostCandidates(admin, asOf),
    loadListingCandidates(admin, asOf),
    loadEventCandidates(createEventsClient(), asOf),
    loadUserFeedState(admin, userId, asOf),
    loadWeights(admin),
    loadEngagement(admin, asOf),
  ])

  const ranked = rankFeed([...posts, ...listings, ...events], state.signals, engagement, weights, asOf)
  const slice = ranked.slice(offset, offset + pageSize)

  const items: FeedItem[] = slice.map((c) => {
    const e = engagement.get(c.key)
    return {
      ...c,
      kind: 'content',
      likes: e?.likes ?? 0,
      saves: e?.saves ?? 0,
      liked: state.liked.has(c.key),
      saved: state.saved.has(c.key),
      following: c.organizationId !== null && state.signals.followedOrgIds.has(c.organizationId),
    }
  })

  if (offset === 0 && items.length >= MARKET_CARD_POSITION) {
    items.splice(MARKET_CARD_POSITION, 0, { kind: 'market', key: 'market' })
  }

  const nextOffset = offset + slice.length
  return {
    items,
    nextCursor: nextOffset < ranked.length ? encodeCursor({ o: nextOffset, t: asOf.toISOString() }) : null,
  }
}
