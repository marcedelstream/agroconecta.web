import type { SupabaseClient } from '@supabase/supabase-js'
import type { FeedSponsoredItem, FeedUserSignals } from './types'

// Publicidad a pantalla completa en el feed (README §3.1, BACKEND §6). Siempre etiquetada
// "PATROCINADO" en la app; acá solo se elige qué campañas le corresponden al usuario.

// 1 patrocinado cada 7 items y ninguno en las primeras posiciones (BACKEND §3.3: cada 6–8, nunca en 1–2).
export const SPONSORED_FIRST_POSITION = 7
export const SPONSORED_EVERY = 7

interface CampaignRow {
  id: string
  title: string
  image_url: string
  target_professions: string[] | null
  target_departments: string[] | null
  target_categories: string[] | null
  starts_at: string
  ends_at: string | null
  advertiser_name?: string | null
  body?: string | null
  cta_label?: string | null
  link_type?: string | null
  link_target?: string | null
}

type Targeting = Pick<CampaignRow, 'target_professions' | 'target_departments' | 'target_categories'>

/** Una segmentación vacía significa "todos"; si tiene valores, el usuario tiene que coincidir. */
export function matchesTargeting(c: Targeting, u: Pick<FeedUserSignals, 'profession' | 'department' | 'interests'>): boolean {
  const ok = (targets: string[] | null, value: string | null) => !targets?.length || (value !== null && targets.includes(value))
  const cats = c.target_categories ?? []
  return (
    ok(c.target_professions, u.profession) &&
    ok(c.target_departments, u.department) &&
    (cats.length === 0 || cats.some((t) => u.interests.includes(t)))
  )
}

export async function loadSponsored(db: SupabaseClient, userId: string, signals: FeedUserSignals, now: Date): Promise<FeedSponsoredItem[]> {
  const nowIso = now.toISOString()
  // select('*'): las columnas nuevas (advertiser_name, body, cta_label) pueden no existir si la
  // migración no se corrió; así esta consulta no rompe el feed.
  const [campaigns, dismissed] = await Promise.all([
    db.from('ad_campaigns').select('*').eq('is_active', true).contains('placement', ['feed']).lte('starts_at', nowIso),
    db.from('user_dismissals').select('ref_id').eq('user_id', userId).eq('kind', 'ad'),
  ])
  if (campaigns.error) return []
  const hidden = new Set(((dismissed.data ?? []) as { ref_id: string }[]).map((d) => d.ref_id))

  return ((campaigns.data ?? []) as CampaignRow[])
    .filter((c) => (!c.ends_at || c.ends_at > nowIso) && !hidden.has(c.id) && matchesTargeting(c, signals))
    .map((c) => ({
      kind: 'sponsored' as const,
      key: `ad:${c.id}`,
      campaignId: c.id,
      advertiserName: c.advertiser_name ?? '',
      title: c.title,
      body: c.body ?? '',
      imageUrl: c.image_url,
      ctaLabel: c.cta_label ?? null,
      linkType: c.link_type ?? null,
      linkTarget: c.link_target ?? null,
    }))
}
