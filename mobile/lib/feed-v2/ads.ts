import { Linking } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { fetchActiveBanners } from '@/lib/supabase-repositories'
import { currentUserId } from './api'
import type { AdCampaign, UserProfile } from '@/lib/types'

// Eventos de publicidad para el reporte al anunciante (supabase/fix-v2-live-ads.sql → ad_events).
// Best-effort: si el insert falla no pasa nada en la UI.

export type AdEventType = 'impression' | 'click' | 'why_opened' | 'dismiss'
export type AdPlacementV2 = 'feed' | 'article_inline'

export async function trackAdEvent(campaignId: string, type: AdEventType, placement: AdPlacementV2, department?: string) {
  const userId = await currentUserId()
  if (!userId) return
  await supabase.from('ad_events').insert({ campaign_id: campaignId, user_id: userId, event_type: type, placement, department: department ?? null })
}

export async function dismissAd(campaignId: string) {
  const userId = await currentUserId()
  if (!userId) return
  await supabase.from('user_dismissals').upsert(
    { user_id: userId, kind: 'ad', ref_id: campaignId },
    { onConflict: 'user_id,kind,ref_id', ignoreDuplicates: true },
  )
}

/** Mismo destino que los banners de la v1: evento, post o URL externa (link_type / link_target). */
export function openAdLink(linkType: string | null, linkTarget: string | null) {
  if (!linkTarget) return
  if (linkType === 'event') router.push(`/(main)/event/${linkTarget}` as never)
  else if (linkType === 'post') router.push(`/(main)/article/${linkTarget}` as never)
  else void Linking.openURL(linkTarget)
}

/**
 * Anuncio para dentro de una noticia (placement 'article_inline'), segmentado en el cliente con los
 * datos del perfil. Reusa el repositorio de banners de la v1 (misma tabla, placement nuevo).
 */
export async function pickInlineAd(user: UserProfile | null): Promise<AdCampaign | null> {
  const ads = await fetchActiveBanners('article_inline').catch(() => [])
  const now = Date.now()
  const fits = (targets: string[], value?: string) => targets.length === 0 || (!!value && targets.includes(value))
  const eligible = ads.filter(
    (a) =>
      a.startsAt.getTime() <= now &&
      (!a.endsAt || a.endsAt.getTime() > now) &&
      fits(a.targetProfessions, user?.profession) &&
      fits(a.targetDepartments, user?.department) &&
      (a.targetCategories.length === 0 || a.targetCategories.some((c) => user?.preferences.includes(c))),
  )
  return eligible[0] ?? null
}
