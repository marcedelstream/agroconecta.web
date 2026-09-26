import { supabase } from '@/lib/supabase'
import { currentUserId } from './api'
import type { FeedEventType, FeedSource } from './types'

// Señales del ranking (BACKEND-Y-DATOS.md §3.1). Se mandan en lotes (cada 10 eventos o cada 15 s),
// nunca de a uno. Si el insert falla se descartan: es telemetría, no puede trabar la UI.

const BATCH_SIZE = 10
const FLUSH_MS = 15_000

interface PendingEvent {
  session_id: string
  source: FeedSource
  source_id: string
  event_type: FeedEventType
  dwell_ms: number | null
  created_at: string
}

const sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
let queue: PendingEvent[] = []
// Lo visto en esta sesión, al instante (la cola tarda hasta 15 s en llegar al servidor). Lo usa el
// "tirar para actualizar" para que la recarga no vuelva a empezar por lo mismo.
const MAX_SESSION_SEEN = 100
const sessionSeen = new Set<string>()

const VIEW_EVENTS: FeedEventType[] = ['impression', 'dwell', 'skip_fast']

export function getSessionSeenKeys(): string[] {
  return [...sessionSeen].slice(-MAX_SESSION_SEEN)
}
let timer: ReturnType<typeof setTimeout> | null = null

export function trackFeedEvent(source: FeedSource, sourceId: string, type: FeedEventType, dwellMs?: number) {
  if (VIEW_EVENTS.includes(type)) {
    const key = `${source}:${sourceId}`
    sessionSeen.delete(key)
    sessionSeen.add(key)
  }
  queue.push({
    session_id: sessionId,
    source,
    source_id: sourceId,
    event_type: type,
    dwell_ms: dwellMs === undefined ? null : Math.round(dwellMs),
    created_at: new Date().toISOString(),
  })
  if (queue.length >= BATCH_SIZE) void flushFeedEvents()
  else if (!timer) timer = setTimeout(() => void flushFeedEvents(), FLUSH_MS)
}

export async function flushFeedEvents() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (queue.length === 0) return
  const batch = queue
  queue = []
  const userId = await currentUserId()
  if (!userId) return
  await supabase.from('feed_events').insert(batch.map((e) => ({ ...e, user_id: userId })))
}
