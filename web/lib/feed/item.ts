import type { SupabaseClient } from '@supabase/supabase-js'
import { loadCandidatesByKeys } from './by-key'
import { createEventsClient, toContentItem } from './context'
import { loadEngagement, loadUserFeedState } from './signals'
import type { FeedCandidate, FeedContentItem, FeedSource } from './types'
import { isUuid } from '@/lib/seo'

// Una publicación suelta por su clave "source:id": la página pública para compartir (/p/…) y el link
// que abre la app directo en esa ficha (GET /api/item).

const SOURCES: FeedSource[] = ['post', 'event', 'listing', 'library']

export function isFeedSource(value: string): value is FeedSource {
  return (SOURCES as string[]).includes(value)
}

// Tablas con slug propio. Los eventos ya usan el slug como id; la biblioteca no tiene.
const SLUG_TABLES: Partial<Record<FeedSource, string>> = { post: 'posts', listing: 'ecosystem_listings' }

/** `idOrSlug`: el id interno o la dirección con el título (lo que aparece en los links compartidos). */
export async function loadCandidate(admin: SupabaseClient, source: FeedSource, idOrSlug: string): Promise<FeedCandidate | null> {
  let id = idOrSlug
  const table = SLUG_TABLES[source]
  if (table && !isUuid(idOrSlug)) {
    const { data } = await admin.from(table).select('id').eq('slug', idOrSlug).maybeSingle()
    if (!data) return null
    id = (data as { id: string }).id
  }
  const key = `${source}:${id}`
  const found = await loadCandidatesByKeys(admin, createEventsClient(), [key])
  return found.get(key) ?? null
}

export async function buildFeedItem(admin: SupabaseClient, userId: string | null, source: FeedSource, id: string): Promise<FeedContentItem | null> {
  const now = new Date()
  const [candidate, state, engagement] = await Promise.all([
    loadCandidate(admin, source, id),
    loadUserFeedState(admin, userId, now),
    loadEngagement(admin, now),
  ])
  return candidate ? toContentItem(candidate, { state, engagement }) : null
}
