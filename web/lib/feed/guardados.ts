import type { SupabaseClient } from '@supabase/supabase-js'
import { loadCandidatesByKeys } from './by-key'
import { createEventsClient, toContentItem } from './context'
import { loadEngagement, loadUserFeedState } from './signals'
import type { FeedCandidate, FeedContentItem } from './types'

// Pestaña Guardados de la app v2 (README §3.5): Guardados · Recordatorios · Actividad.

const SAVES_LIMIT = 100
const ACTIVITY_WINDOW_DAYS = 30
const ACTIVITY_EVENTS_LIMIT = 3000
const ACTIVITY_RECENT = 3

export type ActivityKind = 'viewed' | 'events' | 'products'

export interface ActivitySummary {
  kind: ActivityKind
  count: number
  /** Títulos de los más recientes. */
  recent: string[]
}

export interface ReminderEntry {
  item: FeedContentItem
  remindAt: string
  enabled: boolean
}

export interface GuardadosPage {
  saved: FeedContentItem[]
  reminders: ReminderEntry[]
  activity: ActivitySummary[]
}

interface ActivityEvent {
  source: string
  source_id: string
  event_type: string
}

const keyOf = (r: { source: string; source_id: string }) => `${r.source}:${r.source_id}`

/** Claves únicas en orden de aparición (los eventos vienen del más nuevo al más viejo). */
function uniqueKeys(rows: ActivityEvent[], predicate: (r: ActivityEvent) => boolean): string[] {
  return [...new Set(rows.filter(predicate).map(keyOf))]
}

/**
 * Contenido visto, eventos visitados y productos/servicios consultados, a partir de feed_events.
 * "Encuestas respondidas" se suma en la Fase 2, cuando existan las encuestas.
 */
export function summarizeActivity(rows: ActivityEvent[], items: Map<string, FeedCandidate>): ActivitySummary[] {
  const opened = (types: string[]) => (r: ActivityEvent) =>
    r.event_type === 'cta_open' && types.includes(items.get(keyOf(r))?.contentType ?? '')
  const groups: [ActivityKind, string[]][] = [
    ['viewed', uniqueKeys(rows, (r) => r.event_type === 'impression' || r.event_type === 'dwell')],
    ['events', uniqueKeys(rows, (r) => r.event_type === 'cta_open' && r.source === 'event')],
    ['products', uniqueKeys(rows, opened(['producto', 'servicio']))],
  ]
  return groups.map(([kind, keys]) => ({
    kind,
    count: keys.length,
    recent: keys
      .map((k) => items.get(k)?.title)
      .filter((t): t is string => !!t)
      .slice(0, ACTIVITY_RECENT),
  }))
}

export async function buildGuardados(admin: SupabaseClient, userId: string): Promise<GuardadosPage> {
  const now = new Date()
  const since = new Date(now.getTime() - ACTIVITY_WINDOW_DAYS * 86_400_000).toISOString()

  const [saves, reminders, activity, state, engagement] = await Promise.all([
    admin.from('content_saves').select('source,source_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(SAVES_LIMIT),
    admin.from('reminders').select('source,source_id,remind_at,enabled').eq('user_id', userId).order('remind_at', { ascending: true }),
    admin
      .from('feed_events')
      .select('source,source_id,event_type')
      .eq('user_id', userId)
      .in('event_type', ['impression', 'dwell', 'cta_open'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(ACTIVITY_EVENTS_LIMIT),
    loadUserFeedState(admin, userId, now),
    loadEngagement(admin, now),
  ])

  const saveKeys = ((saves.data ?? []) as ActivityEvent[]).map(keyOf)
  const reminderRows = (reminders.data ?? []) as (ActivityEvent & { remind_at: string; enabled: boolean })[]
  const activityRows = (activity.data ?? []) as ActivityEvent[]
  // Para Actividad alcanza con resolver lo abierto y los vistos más recientes (no todo el historial).
  const activityKeys = [
    ...uniqueKeys(activityRows, (r) => r.event_type === 'cta_open'),
    ...uniqueKeys(activityRows, (r) => r.event_type !== 'cta_open').slice(0, ACTIVITY_RECENT),
  ]

  const items = await loadCandidatesByKeys(admin, createEventsClient(), [
    ...new Set([...saveKeys, ...reminderRows.map(keyOf), ...activityKeys]),
  ])
  const ctx = { state, engagement }
  const toItem = (key: string) => {
    const c = items.get(key)
    return c ? toContentItem(c, ctx) : null
  }

  return {
    saved: saveKeys.map(toItem).filter((i): i is FeedContentItem => i !== null),
    reminders: reminderRows.flatMap((r) => {
      const item = toItem(keyOf(r))
      return item ? [{ item, remindAt: r.remind_at, enabled: r.enabled }] : []
    }),
    activity: summarizeActivity(activityRows, items),
  }
}
