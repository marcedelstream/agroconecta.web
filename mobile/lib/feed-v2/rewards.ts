import { supabase } from '@/lib/supabase'
import { notifyPointsChanged } from './points'

// Premios y canjes (supabase/fix-v2-rewards.sql). El canje lo hace el servidor en una sola
// transacción: la app solo pide y muestra el código.

export interface Reward {
  id: string
  kind: 'curso' | 'evento' | 'charla'
  title: string
  description: string | null
  partnerName: string | null
  imageUrl: string | null
  cost: number
  stock: number | null
}

export interface Redemption {
  id: string
  code: string
  status: 'emitido' | 'usado' | 'vencido' | 'anulado'
  createdAt: string
  rewardTitle: string
}

interface RewardRow {
  id: string
  kind: Reward['kind']
  title: string
  description: string | null
  partner_name: string | null
  image_url: string | null
  cost: number
  stock: number | null
  valid_until: string | null
}

interface RedemptionRow {
  id: string
  code: string
  status: Redemption['status']
  created_at: string
  rewards: { title: string } | null
}

export async function fetchRewards(): Promise<Reward[]> {
  const { data, error } = await supabase.from('rewards').select('id,kind,title,description,partner_name,image_url,cost,stock,valid_until').order('cost')
  if (error) return []
  const now = new Date().toISOString()
  return ((data ?? []) as RewardRow[])
    .filter((r) => !r.valid_until || r.valid_until > now)
    .map((r) => ({ id: r.id, kind: r.kind, title: r.title, description: r.description, partnerName: r.partner_name, imageUrl: r.image_url, cost: r.cost, stock: r.stock }))
}

export async function fetchMyRedemptions(): Promise<Redemption[]> {
  const { data, error } = await supabase.from('reward_redemptions').select('id,code,status,created_at,rewards(title)').order('created_at', { ascending: false })
  if (error) return []
  return ((data ?? []) as unknown as RedemptionRow[]).map((r) => ({
    id: r.id,
    code: r.code,
    status: r.status,
    createdAt: r.created_at,
    rewardTitle: r.rewards?.title ?? '',
  }))
}

export type RedeemResult =
  | { ok: true; code: string; balance: number }
  | { ok: false; error: 'unavailable' | 'out_of_stock' | 'insufficient' | 'network'; missing?: number }

export async function redeemReward(rewardId: string): Promise<RedeemResult> {
  const { data, error } = await supabase.rpc('redeem_reward', { p_reward: rewardId })
  if (error || !data) return { ok: false, error: 'network' }
  const result = data as RedeemResult
  if (result.ok) notifyPointsChanged()
  return result
}
