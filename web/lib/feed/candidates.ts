import type { SupabaseClient } from '@supabase/supabase-js'
import {
  EVENT_COLUMNS,
  LISTING_COLUMNS,
  mapEventRows,
  mapListingRow,
  mapPostRow,
  POST_COLUMNS,
  type EventRow,
  type ListingRow,
  type PostRow,
} from './rows'
import type { FeedCandidate } from './types'

// Carga los candidatos del feed desde sus tres fuentes (por ventana de fechas). Cada fuente es
// best-effort: si una falla (tabla sin migrar, base de eventos caída) el feed sale con las otras.

const POSTS_WINDOW_DAYS = 60
const POSTS_LIMIT = 200
const LISTINGS_LIMIT = 100
const EVENTS_LIMIT = 60

export async function loadPostCandidates(db: SupabaseClient, asOf: Date): Promise<FeedCandidate[]> {
  const since = new Date(asOf.getTime() - POSTS_WINDOW_DAYS * 86_400_000).toISOString()
  const { data, error } = await db
    .from('posts')
    .select(POST_COLUMNS)
    .eq('editorial_status', 'published')
    .gte('published_at', since)
    .lte('published_at', asOf.toISOString())
    .order('published_at', { ascending: false })
    .limit(POSTS_LIMIT)

  if (error) {
    console.error('feed: posts falló:', error.message)
    return []
  }

  return (data as unknown as PostRow[])
    .filter((r) => r.auction_status !== 'finished' && r.auction_status !== 'unavailable')
    .map((r) => mapPostRow(r, asOf.toISOString()))
}

export async function loadListingCandidates(db: SupabaseClient, asOf: Date): Promise<FeedCandidate[]> {
  const { data, error } = await db
    .from('ecosystem_listings')
    .select(LISTING_COLUMNS)
    .eq('is_active', true)
    .lte('published_at', asOf.toISOString())
    .order('published_at', { ascending: false })
    .limit(LISTINGS_LIMIT)

  if (error) {
    console.error('feed: ecosystem_listings falló:', error.message)
    return []
  }
  return (data as ListingRow[]).map(mapListingRow)
}

/** `events` es el cliente de la base externa de eventosagropy.com (solo lectura). */
export async function loadEventCandidates(events: SupabaseClient | null, asOf: Date): Promise<FeedCandidate[]> {
  if (!events) return []
  const today = asOf.toISOString().split('T')[0]
  const { data, error } = await events
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('is_approved', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(EVENTS_LIMIT)

  if (error) {
    console.error('feed: eventos externos falló:', error.message)
    return []
  }
  return mapEventRows(events, data as EventRow[])
}
