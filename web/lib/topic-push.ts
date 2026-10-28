import type { SupabaseClient } from '@supabase/supabase-js'
import { loadContentTags } from './content-tags'
import { loadCandidatesByKeys } from './feed/by-key'
import { createEventsClient } from './feed/context'
import { loadInterestOptions } from './interest-options'
import { sendPushToUsers } from './push'
import { pickTopicRecipients, topicPushData, topicTitle, type FacetRow } from './topic-push-rules'

// Avisos por tema ("Novedades de tus temas", reemplaza a las alertas de clima): al publicar un contenido con
// etiquetas, push a quien eligió esas etiquetas. Tablas en supabase/fix-v2-topic-push.sql.
// Best-effort: nunca tira, así no frena el guardado del panel.

const CHUNK = 200

async function inChunks<T>(ids: string[], load: (chunk: string[]) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
  const out: T[] = []
  for (let i = 0; i < ids.length; i += CHUNK) {
    const { data } = await load(ids.slice(i, i + CHUNK))
    out.push(...(data ?? []))
  }
  return out
}

export async function notifyContentTopics(db: SupabaseClient, contentKey: string): Promise<number> {
  try {
    const tags = await loadContentTags(db, contentKey)
    if (tags.length === 0) return 0

    // Solo contenido visible (las noticias tienen que estar publicadas) y eventos que todavía no pasaron.
    const item = (await loadCandidatesByKeys(db, createEventsClient(), [contentKey])).get(contentKey)
    if (!item) return 0
    if (item.source === 'event' && item.startsAt && new Date(item.startsAt).getTime() < Date.now()) return 0

    // Reserva el contenido: si ya se avisó (o la tabla no existe) no se manda nada.
    const { error: claimError } = await db.from('topic_push_sent').insert({ content_key: contentKey })
    if (claimError) return 0

    const { data: facetData } = await db.from('user_profile_facets').select('user_id,value').eq('facet', 'produccion').in('value', tags)
    const facets = (facetData ?? []) as FacetRow[]
    const userIds = [...new Set(facets.map((f) => f.user_id))]
    if (userIds.length === 0) return 0

    const today = new Date().toISOString().slice(0, 10)
    const [profiles, sentToday, options] = await Promise.all([
      inChunks<{ id: string; notification_prefs: Record<string, boolean> | null }>(userIds, (c) => db.from('profiles').select('id,notification_prefs').in('id', c)),
      inChunks<{ user_id: string }>(userIds, (c) => db.from('topic_push_daily').select('user_id').eq('sent_on', today).in('user_id', c)),
      loadInterestOptions(db),
    ])
    const prefs = new Map(profiles.map((p) => [p.id, p.notification_prefs]))
    const recipients = pickTopicRecipients(tags, facets, prefs, new Set(sentToday.map((r) => r.user_id)))
    if (recipients.length === 0) return 0

    const labels = tags.map((t) => options.find((o) => o.kind === 'produccion' && o.value === t)?.label ?? t)
    await sendPushToUsers(recipients, { title: topicTitle(labels), body: item.title, data: topicPushData(contentKey) })
    await db.from('topic_push_daily').upsert(recipients.map((user_id) => ({ user_id, sent_on: today })), { onConflict: 'user_id,sent_on' })
    await db.from('topic_push_sent').update({ recipients: recipients.length }).eq('content_key', contentKey)
    return recipients.length
  } catch (err) {
    console.error('topic-push: no se pudo avisar', contentKey, err)
    return 0
  }
}
