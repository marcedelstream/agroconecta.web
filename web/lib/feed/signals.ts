import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_WEIGHTS } from './ranking'
import type { FeedEngagement, FeedUserSignals, FeedWeights, SeenState } from './types'

// Lecturas por usuario y agregadas para el ranking. Todo con service role (el route ya validó el
// JWT y pasa el userId real). Best-effort: si una tabla v2 todavía no está migrada, se usa vacío.

const SEEN_WINDOW_DAYS = 14
const SEEN_LIMIT = 2000
const STATS_WINDOW_DAYS = 30

interface KeyRow {
  source: string
  source_id: string
}

interface FeedEventRow extends KeyRow {
  event_type: string
}

interface StatsRow extends KeyRow {
  impressions: number | string
  cta_opens: number | string
  likes: number | string
  saves: number | string
}

const toKey = (r: KeyRow) => `${r.source}:${r.source_id}`

export interface UserFeedState {
  signals: FeedUserSignals
  liked: Set<string>
  saved: Set<string>
}

export async function loadUserFeedState(db: SupabaseClient, userId: string, now: Date): Promise<UserFeedState> {
  const seenSince = new Date(now.getTime() - SEEN_WINDOW_DAYS * 86_400_000).toISOString()

  const [profile, interests, facets, subs, events, likes, saves] = await Promise.all([
    db.from('profiles').select('department,profession').eq('id', userId).maybeSingle(),
    db.from('user_interests').select('category').eq('user_id', userId),
    db.from('user_profile_facets').select('value').eq('user_id', userId).in('facet', ['rubro', 'produccion']),
    db.from('user_subscriptions').select('organization_id').eq('user_id', userId),
    db
      .from('feed_events')
      .select('source,source_id,event_type')
      .eq('user_id', userId)
      .in('event_type', ['impression', 'skip_fast'])
      .gte('created_at', seenSince)
      .limit(SEEN_LIMIT),
    db.from('content_likes').select('source,source_id').eq('user_id', userId),
    db.from('content_saves').select('source,source_id').eq('user_id', userId),
  ])

  const seen = new Map<string, SeenState>()
  for (const r of (events.data ?? []) as FeedEventRow[]) {
    const key = toKey(r)
    if (r.event_type === 'skip_fast') seen.set(key, 'skipped')
    else if (!seen.has(key)) seen.set(key, 'seen')
  }

  const interestList = [
    ...((interests.data ?? []) as { category: string }[]).map((r) => r.category),
    ...((facets.data ?? []) as { value: string }[]).map((r) => r.value),
  ]

  const p = profile.data as { department: string | null; profession: string | null } | null

  return {
    signals: {
      department: p?.department ?? null,
      profession: p?.profession ?? null,
      interests: [...new Set(interestList)],
      followedOrgIds: new Set(((subs.data ?? []) as { organization_id: string }[]).map((r) => r.organization_id)),
      seen,
    },
    liked: new Set(((likes.data ?? []) as KeyRow[]).map(toKey)),
    saved: new Set(((saves.data ?? []) as KeyRow[]).map(toKey)),
  }
}

export async function loadWeights(db: SupabaseClient): Promise<FeedWeights> {
  const { data, error } = await db.from('feed_weights').select('key,value')
  if (error || !data) return DEFAULT_WEIGHTS

  const weights: FeedWeights = { ...DEFAULT_WEIGHTS }
  for (const row of data as { key: string; value: number | string }[]) {
    if (row.key in weights) weights[row.key as keyof FeedWeights] = Number(row.value)
  }
  return weights
}

export async function loadEngagement(db: SupabaseClient, now: Date): Promise<Map<string, FeedEngagement>> {
  const since = new Date(now.getTime() - STATS_WINDOW_DAYS * 86_400_000).toISOString()
  const { data, error } = await db.rpc('feed_item_stats', { p_since: since })
  const map = new Map<string, FeedEngagement>()
  if (error || !data) return map

  for (const r of data as StatsRow[]) {
    map.set(toKey(r), {
      impressions: Number(r.impressions),
      ctaOpens: Number(r.cta_opens),
      likes: Number(r.likes),
      saves: Number(r.saves),
    })
  }
  return map
}
