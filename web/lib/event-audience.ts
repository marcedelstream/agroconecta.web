import 'server-only'

import { createSupabaseAdmin } from './supabase-admin'

export interface EventAudience {
  slug: string
  title: string
  count: number
}

// Adheridos a un evento = quienes prendieron su campanita (event_bell, supabase/fix-v2-event-bell.sql) más quienes le
// pusieron recordatorio desde Guardados (reminders). Cada persona cuenta una vez.
async function rows() {
  const db = createSupabaseAdmin()
  const [bell, reminders] = await Promise.all([
    db.from('event_bell').select('user_id, event_slug, event_title'),
    db.from('reminders').select('user_id, source_id, title').eq('source', 'event').eq('enabled', true),
  ])
  return [
    ...(bell.data ?? []).map((r) => ({ userId: r.user_id as string, slug: r.event_slug as string, title: r.event_title as string })),
    ...(reminders.data ?? []).map((r) => ({ userId: r.user_id as string, slug: r.source_id as string, title: r.title as string })),
  ]
}

/** Eventos con al menos un adherido, para elegir a quién mandar el aviso. */
export async function listEventAudiences(): Promise<EventAudience[]> {
  const bySlug = new Map<string, { title: string; users: Set<string> }>()
  for (const r of await rows()) {
    const entry = bySlug.get(r.slug) ?? { title: r.title, users: new Set<string>() }
    entry.users.add(r.userId)
    bySlug.set(r.slug, entry)
  }
  return [...bySlug.entries()]
    .map(([slug, e]) => ({ slug, title: e.title, count: e.users.size }))
    .sort((a, b) => b.count - a.count)
}

export async function eventAudienceUserIds(slug: string): Promise<string[]> {
  return [...new Set((await rows()).filter((r) => r.slug === slug).map((r) => r.userId))]
}
