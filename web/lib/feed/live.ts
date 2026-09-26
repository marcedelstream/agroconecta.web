import type { SupabaseClient } from '@supabase/supabase-js'
import { youtubeThumbnail } from './normalize'

// Aviso EN VIVO (README §3.1, BACKEND §7): lo que está transmitiendo ahora. Dos fuentes: las
// transmisiones que el admin prende en `live_sessions`, y los remates con auction_status = 'live'
// que ya existían en `posts` (v1).

export interface LiveItem {
  key: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  streamUrl: string
  /** Contenido asociado para abrir su ficha / pantalla (evento por slug, remate por id). */
  source: 'post' | 'event' | 'listing' | null
  sourceId: string | null
  dismissed: boolean
}

interface SessionRow {
  id: string
  source: LiveItem['source']
  source_id: string | null
  title: string
  subtitle: string | null
  stream_url: string
  image_url: string | null
}

interface LivePostRow {
  id: string
  title: string
  youtube_url: string | null
  image_url: string | null
}

export async function loadLive(db: SupabaseClient, userId: string): Promise<LiveItem[]> {
  const [sessions, posts, dismissed] = await Promise.all([
    db.from('live_sessions').select('id,source,source_id,title,subtitle,stream_url,image_url').eq('is_live', true).order('started_at', { ascending: false }),
    db.from('posts').select('id,title,youtube_url,image_url').eq('editorial_status', 'published').eq('auction_status', 'live').not('youtube_url', 'is', null),
    db.from('user_dismissals').select('ref_id').eq('user_id', userId).eq('kind', 'live'),
  ])
  const hidden = new Set(((dismissed.data ?? []) as { ref_id: string }[]).map((d) => d.ref_id))

  const fromSessions: LiveItem[] = ((sessions.data ?? []) as SessionRow[]).map((s) => ({
    key: `live:${s.id}`,
    title: s.title,
    subtitle: s.subtitle,
    imageUrl: s.image_url,
    streamUrl: s.stream_url,
    source: s.source,
    sourceId: s.source_id,
    dismissed: hidden.has(`live:${s.id}`),
  }))
  const fromPosts: LiveItem[] = ((posts.data ?? []) as LivePostRow[]).map((p) => ({
    key: `post:${p.id}`,
    title: p.title,
    subtitle: null,
    imageUrl: p.image_url ?? youtubeThumbnail(p.youtube_url),
    streamUrl: p.youtube_url ?? '',
    source: 'post',
    sourceId: p.id,
    dismissed: hidden.has(`post:${p.id}`),
  }))
  return [...fromSessions, ...fromPosts]
}
