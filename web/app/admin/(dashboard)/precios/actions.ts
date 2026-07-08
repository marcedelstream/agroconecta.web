'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar precios.')
  return auth
}

function toNumber(value: FormDataEntryValue | null): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function createMarketPrice(formData: FormData) {
  const auth = await requireAdmin()
  const supabase = createSupabaseAdmin()

  const label = String(formData.get('label') ?? '').trim()
  const market = String(formData.get('market') ?? '').trim()
  const unit = String(formData.get('unit') ?? '').trim()
  if (!label || !market || !unit) return

  await supabase.from('market_prices').insert({
    kind: String(formData.get('kind') ?? 'cattle'),
    label,
    market,
    currency: String(formData.get('currency') ?? 'PYG'),
    unit,
    value: toNumber(formData.get('value')),
    change: toNumber(formData.get('change')),
    change_percent: toNumber(formData.get('change_percent')),
    created_by: auth.userId,
    updated_at: new Date().toISOString(),
  })

  revalidatePath('/admin/precios')
  revalidatePath('/')
}

export async function updateMarketPrice(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return

  await supabase
    .from('market_prices')
    .update({
      value: toNumber(formData.get('value')),
      change: toNumber(formData.get('change')),
      change_percent: toNumber(formData.get('change_percent')),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/precios')
  revalidatePath('/')
}

export async function deleteMarketPrice(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  await supabase.from('market_prices').delete().eq('id', id)

  revalidatePath('/admin/precios')
  revalidatePath('/')
}
