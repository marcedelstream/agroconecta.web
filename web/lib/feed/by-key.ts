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

// Carga items puntuales por clave "source:id" (Guardados, Recordatorios, Actividad), sin la ventana de
// fechas del feed: algo guardado hace meses tiene que seguir apareciendo.

function idsFor(keys: string[], source: string): string[] {
  const prefix = `${source}:`
  return keys.filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length))
}

export async function loadCandidatesByKeys(
  db: SupabaseClient,
  events: SupabaseClient | null,
  keys: string[],
): Promise<Map<string, FeedCandidate>> {
  const postIds = idsFor(keys, 'post')
  const listingIds = idsFor(keys, 'listing')
  const eventSlugs = idsFor(keys, 'event')
  const now = new Date().toISOString()

  const [posts, listings, eventRows] = await Promise.all([
    postIds.length ? db.from('posts').select(POST_COLUMNS).in('id', postIds).eq('editorial_status', 'published') : null,
    listingIds.length ? db.from('ecosystem_listings').select(LISTING_COLUMNS).in('id', listingIds) : null,
    events && eventSlugs.length ? events.from('events').select(EVENT_COLUMNS).in('slug', eventSlugs) : null,
  ])

  const found: FeedCandidate[] = [
    ...((posts?.data ?? []) as unknown as PostRow[]).map((r) => mapPostRow(r, now)),
    ...((listings?.data ?? []) as ListingRow[]).map(mapListingRow),
    ...(events && eventRows?.data ? await mapEventRows(events, eventRows.data as EventRow[]) : []),
  ]
  return new Map(found.map((c) => [c.key, c]))
}
