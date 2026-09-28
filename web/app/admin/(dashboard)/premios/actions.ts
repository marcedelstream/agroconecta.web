'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'
import { backWithError, backWithOk } from '@/lib/admin-feedback'

const PATH = '/admin/premios'

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
  if (!title || !(KINDS as readonly string[]).includes(kind) || !(cost > 0)) backWithError(PATH, 'Faltan datos: título, tipo y costo en puntos (mayor a 0).')
  const { error } = await createSupabaseAdmin().from('rewards').insert({
    title,
    kind,
    cost: Math.round(cost),
    stock: stockRaw ? Math.max(0, Math.round(Number(stockRaw))) : null,
    partner_name: String(formData.get('partner_name') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    valid_until: String(formData.get('valid_until') ?? '') || null,
  })
  if (error) backWithError(PATH, `No se pudo crear el premio: ${error.message}`)
  revalidatePath(PATH)
  backWithOk(PATH, 'Premio creado. Ya se puede canjear en la app.')
}

export async function toggleReward(formData: FormData) {
  await requireAdmin()
  await createSupabaseAdmin()
    .from('rewards')
    .update({ is_active: formData.get('is_active') !== 'true' })
    .eq('id', String(formData.get('id') ?? ''))
  revalidatePath(PATH)
  backWithOk(PATH, formData.get('is_active') === 'true' ? 'Premio pausado.' : 'Premio activado.')
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
    .gt('expires_at', new Date().toISOString())
    .select('id')
  revalidatePath(PATH)
  if (data && data.length > 0) backWithOk(PATH, `Código ${code} validado: quedó marcado como usado.`)
  backWithError(PATH, `El código ${code} no existe, ya se usó o venció (duran 60 días). No lo aceptes.`)
}

// Reglamento de puntos: si alguien hace trampa (ej. varias cuentas) se anulan sus puntos; la cuenta sigue.
export async function voidUserPoints(formData: FormData) {
  await requireAdmin()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const reason = String(formData.get('reason') ?? '').trim()
  if (!email) backWithError(PATH, 'Escribí el correo de la cuenta.')
  const db = createSupabaseAdmin()
  const { data: profile } = await db.from('profiles').select('id').ilike('email', email).maybeSingle()
  if (!profile) backWithError(PATH, `No encontramos una cuenta con el correo ${email}.`)
  const { data: voided, error } = await db.rpc('void_user_points', { p_user: (profile as { id: string }).id, p_reason: reason })
  if (error) backWithError(PATH, `No se pudo anular: ${error.message}`)
  revalidatePath(PATH)
  backWithOk(PATH, Number(voided) > 0 ? `Anulamos ${voided} puntos de ${email}.` : `${email} no tenía puntos para anular.`)
}
