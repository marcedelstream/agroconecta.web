'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

const KINDS = ['curso', 'evento', 'charla'] as const

async function requireAdmin() {
  if (!(await getAuthContext())) throw new Error('No tenés permiso para administrar premios.')
}

export async function createReward(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  const kind = String(formData.get('kind') ?? '')
  const cost = Number(formData.get('cost'))
  const stockRaw = String(formData.get('stock') ?? '').trim()
  if (!title || !(KINDS as readonly string[]).includes(kind) || !(cost > 0)) throw new Error('Título, tipo y costo (> 0) son obligatorios.')
  const { error } = await createSupabaseAdmin().from('rewards').insert({
    title,
    kind,
    cost: Math.round(cost),
    stock: stockRaw ? Math.max(0, Math.round(Number(stockRaw))) : null,
    partner_name: String(formData.get('partner_name') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    valid_until: String(formData.get('valid_until') ?? '') || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/premios')
}

export async function toggleReward(formData: FormData) {
  await requireAdmin()
  await createSupabaseAdmin()
    .from('rewards')
    .update({ is_active: formData.get('is_active') !== 'true' })
    .eq('id', String(formData.get('id') ?? ''))
  revalidatePath('/admin/premios')
}

// El aliado u organizador valida el código AGRO-XXXX al momento de usarlo.
export async function markRedemptionUsed(formData: FormData) {
  await requireAdmin()
  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  const { data } = await createSupabaseAdmin()
    .from('reward_redemptions')
    .update({ status: 'usado', used_at: new Date().toISOString() })
    .eq('code', code)
    .eq('status', 'emitido')
    .select('id')
  revalidatePath('/admin/premios')
  redirect(`/admin/premios?codigo=${encodeURIComponent(code)}&resultado=${data && data.length > 0 ? 'ok' : 'no'}`)
}
