import type { SupabaseClient } from '@supabase/supabase-js'
import { loadCandidatesByKeys } from './by-key'
import { createEventsClient, toContentItem } from './context'
import { loadEngagement, loadUserFeedState } from './signals'
import type { FeedCandidate, FeedContentItem, FeedContentType } from './types'

// Página de un aliado en la app (/api/aliado): sus noticias + lo que el equipo le anexa desde el panel
// (organization_content, supabase/fix-v2-ally-content.sql), agrupado como lo muestra la app.

const OWN_POSTS_LIMIT = 10

export interface AllyPage {
  events: FeedContentItem[]
  news: FeedContentItem[]
  learn: FeedContentItem[]
}

const GROUP: Record<FeedContentType, keyof AllyPage | null> = {
  evento: 'events',
  remate: 'events',
  noticia: 'news',
  video: 'news',
  curso: 'learn',
  empleo: 'learn',
  producto: 'learn',
  libro: 'learn',
  servicio: 'learn',
}

/** Agrupa y ordena: eventos por fecha (los que ya pasaron afuera), el resto como viene. */
export function groupAllyItems(items: FeedContentItem[], now: Date = new Date()): AllyPage {
  const page: AllyPage = { events: [], news: [], learn: [] }
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString()
  for (const item of items) {
    const group = GROUP[item.contentType]
    if (!group) continue
    if (group === 'events' && item.contentType === 'evento' && item.startsAt && item.startsAt < dayAgo) continue
    page[group].push(item)
  }
  page.events.sort((a, b) => (a.startsAt ?? '9999').localeCompare(b.startsAt ?? '9999'))
  return page
}

export async function buildAllyPage(admin: SupabaseClient, orgId: string, userId: string | null): Promise<AllyPage> {
  const now = new Date()
  const [linked, own, state, engagement] = await Promise.all([
    admin.from('organization_content').select('content_key').eq('organization_id', orgId).order('position'),
    admin
      .from('posts')
      .select('id')
      .eq('organization_id', orgId)
      .eq('editorial_status', 'published')
      .order('published_at', { ascending: false })
      .limit(OWN_POSTS_LIMIT),
    loadUserFeedState(admin, userId, now),
    loadEngagement(admin, now),
  ])

  // Sin la tabla migrada, la página sale igual con las noticias propias.
  const linkedKeys = linked.error ? [] : ((linked.data ?? []) as { content_key: string }[]).map((r) => r.content_key)
  const ownKeys = ((own.data ?? []) as { id: string }[]).map((r) => `post:${r.id}`)
  const keys = [...new Set([...linkedKeys, ...ownKeys])]

  const found: Map<string, FeedCandidate> = await loadCandidatesByKeys(admin, createEventsClient(), keys)
  const items = keys
    .map((k) => found.get(k))
    .filter((c): c is FeedCandidate => !!c)
    .map((c) => toContentItem(c, { state, engagement }))
  return groupAllyItems(items, now)
}
