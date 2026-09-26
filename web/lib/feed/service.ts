import type { SupabaseClient } from '@supabase/supabase-js'
import { loadRankingContext, toContentItem } from './context'
import { chronologicalEvents, deprioritizeSeen, MARKET_CARD_POSITION, rankFeed, sortByStart } from './ranking'
import { filterCandidates, searchRefs, trendingTags, type ExploreFilters, type TrendingTag } from './explore'
import { interleaveEvery, interleaveInteractive, loadInteractive } from './interactive'
import { loadSponsored, SPONSORED_EVERY, SPONSORED_FIRST_POSITION } from './sponsored'
import type { FeedCandidate, FeedContentItem, FeedInteractiveItem, FeedItem, FeedPage, FeedSponsoredItem } from './types'

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

const SEEN_KEY_PATTERN = /^(post|event|listing):[A-Za-z0-9_-]{1,80}$/
const MAX_SEEN_KEYS = 100

/** Parámetro `seen` de /api/feed: claves "source:id" separadas por coma. Lo inválido se ignora. */
export function parseSeenParam(raw: string | null): Set<string> {
  if (!raw) return new Set()
  return new Set(raw.split(',').filter((k) => SEEN_KEY_PATTERN.test(k)).slice(0, MAX_SEEN_KEYS))
}

export async function buildFeedPage(
  admin: SupabaseClient,
  userId: string,
  cursor: Cursor | null,
  pageSize: number,
  sessionSeen: Set<string> = new Set(),
): Promise<FeedPage> {
  const asOf = cursor ? new Date(cursor.t) : new Date()
  const offset = cursor?.o ?? 0

  const [ctx, interactive] = await Promise.all([
    loadRankingContext(admin, userId, asOf),
    loadInteractive(admin, userId, asOf).catch(() => [] as FeedInteractiveItem[]),
  ])
  const ranked = deprioritizeSeen(
    chronologicalEvents(rankFeed(ctx.candidates, ctx.state.signals, ctx.engagement, ctx.weights, asOf)),
    sessionSeen,
  )
  const sponsored = await loadSponsored(admin, userId, ctx.state.signals, asOf).catch(() => [] as FeedSponsoredItem[])
  const merged = interleaveEvery<FeedCandidate | FeedInteractiveItem, FeedSponsoredItem>(
    interleaveInteractive<FeedCandidate, FeedInteractiveItem>(ranked, interactive),
    sponsored,
    SPONSORED_FIRST_POSITION,
    SPONSORED_EVERY,
  )
  const slice = merged.slice(offset, offset + pageSize)
  const items: FeedItem[] = slice.map((e) => ('kind' in e ? e : toContentItem(e, ctx)))

  if (offset === 0 && items.length >= MARKET_CARD_POSITION) {
    items.splice(MARKET_CARD_POSITION, 0, { kind: 'market', key: 'market' })
  }

  const nextOffset = offset + slice.length
  return {
    items,
    nextCursor: nextOffset < merged.length ? encodeCursor({ o: nextOffset, t: asOf.toISOString() }) : null,
  }
}

const EXPLORE_LIMIT = 40

export interface ExplorePage {
  items: FeedContentItem[]
  trending: TrendingTag[]
}

/** Resultados de Explorar, ordenados con el mismo ranking del feed (lo más relevante para el usuario primero). */
export async function buildExplorePage(admin: SupabaseClient, userId: string, filters: ExploreFilters): Promise<ExplorePage> {
  const asOf = new Date()
  const ctx = await loadRankingContext(admin, userId, asOf)
  const matches = filterCandidates(ctx.candidates, filters)
  // Eventos y remates se buscan por fecha: en esas categorías la lista es estrictamente cronológica.
  const byDate = filters.type === 'evento' || filters.type === 'remate'
  const ranked = byDate ? sortByStart(matches) : chronologicalEvents(rankFeed(matches, ctx.state.signals, ctx.engagement, ctx.weights, asOf))
  return {
    items: ranked.slice(0, EXPLORE_LIMIT).map((c) => toContentItem(c, ctx)),
    trending: trendingTags(ctx.candidates, asOf),
  }
}

/** Contenido relacionado a un mensaje de Karai, listo para abrir en la ficha de la app. */
export async function buildKaraiRefs(admin: SupabaseClient, userId: string, message: string): Promise<FeedContentItem[]> {
  const ctx = await loadRankingContext(admin, userId, new Date())
  return searchRefs(ctx.candidates, message).map((c) => toContentItem(c, ctx))
}
