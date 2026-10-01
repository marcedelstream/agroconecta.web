import { Platform, Share } from 'react-native'
import { supabase } from '@/lib/supabase'
import { currentUserId, WEB_BASE_URL } from './api'
import type { FeedContentItem, FeedSource } from './types'

// Escrituras directas con RLS de dueño (supabase/fix-v2-feed.sql). Devuelven false si no se pudo
// persistir, para que la UI revierta el cambio optimista.

async function toggleRow(table: 'content_likes' | 'content_saves', source: FeedSource, sourceId: string, on: boolean) {
  const userId = await currentUserId()
  if (!userId) return false
  const row = { user_id: userId, source, source_id: sourceId }
  const { error } = on
    ? await supabase.from(table).upsert(row, { onConflict: 'user_id,source,source_id', ignoreDuplicates: true })
    : await supabase.from(table).delete().match(row)
  return !error
}

export const setLiked = (item: FeedContentItem, on: boolean) => toggleRow('content_likes', item.source, item.sourceId, on)
export const setSaved = (item: FeedContentItem, on: boolean) => toggleRow('content_saves', item.source, item.sourceId, on)

/** Solo organizaciones propias (posts). Los eventos externos y los listings no se pueden seguir todavía. */
export function canFollow(item: FeedContentItem): boolean {
  return item.source === 'post' && item.organizationId !== null
}

// "Seguir" = user_subscriptions, la misma tabla que usa el onboarding v1.
export async function setFollowing(item: FeedContentItem, on: boolean): Promise<boolean> {
  const userId = await currentUserId()
  if (!userId || !canFollow(item) || !item.organizationId) return false
  const row = { user_id: userId, organization_id: item.organizationId }
  const { error } = on
    ? await supabase.from('user_subscriptions').upsert(row, { onConflict: 'user_id,organization_id', ignoreDuplicates: true })
    : await supabase.from('user_subscriptions').delete().match(row)
  return !error
}

// Página web de cada publicación (web/app/p/…): muestra lo principal e invita a abrirla o bajar la app.
function shareUrl(item: FeedContentItem): string {
  return `${WEB_BASE_URL}/p/${item.source}/${encodeURIComponent(item.slug || item.sourceId)}`
}

/** true si el usuario completó el envío (para registrar el evento `share`). */
export async function shareItem(item: FeedContentItem): Promise<boolean> {
  try {
    const url = shareUrl(item)
    // En iOS el url va aparte para que se comparta como link (con vista previa); Android solo usa message.
    const result = await Share.share(Platform.OS === 'ios' ? { message: item.title, url } : { message: `${item.title}\n${url}` })
    return result.action === Share.sharedAction
  } catch {
    return false
  }
}
