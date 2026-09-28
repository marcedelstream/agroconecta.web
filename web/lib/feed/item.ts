import type { SupabaseClient } from '@supabase/supabase-js'
import { loadCandidatesByKeys } from './by-key'
import { createEventsClient, toContentItem } from './context'
import { loadEngagement, loadUserFeedState } from './signals'
import type { FeedCandidate, FeedContentItem, FeedSource } from './types'

// Una publicación suelta por su clave "source:id": la página pública para compartir (/p/…) y el link
// que abre la app directo en esa ficha (GET /api/item).

const SOURCES: FeedSource[] = ['post', 'event', 'listing']

export function isFeedSource(value: string): value is FeedSource {
  return (SOURCES as string[]).includes(value)
}

export async function loadCandidate(admin: SupabaseClient, source: FeedSource, id: string): Promise<FeedCandidate | null> {
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
