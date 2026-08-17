'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

export type MembershipActionState = { error: string | null; success: string | null }

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar consultas.')
}

export async function markLeadHandled(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  await supabase.from('service_leads').update({ status: 'atendido' }).eq('id', id)
  revalidatePath('/admin/consultas')
}

export async function reopenLead(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  await supabase.from('service_leads').update({ status: 'pendiente' }).eq('id', id)
  revalidatePath('/admin/consultas')
}

export async function activateMembership(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const leadId = String(formData.get('lead_id') ?? '')
  const userId = String(formData.get('user_id') ?? '')
  if (!userId) return

  await supabase.from('profiles').update({ is_member: true }).eq('id', userId)
  if (leadId) await supabase.from('service_leads').update({ status: 'atendido' }).eq('id', leadId)
  revalidatePath('/admin/consultas')
}

export async function activateMembershipByEmail(
  _prev: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No tenés permiso.', success: null }
  }

  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  if (!email) return { error: 'Ingresá un email.', success: null }

  const supabase = createSupabaseAdmin()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id,name,email')
    .ilike('email', email)
    .maybeSingle()

  if (!profile) {
    return { error: `No se encontró ningún usuario con el email "${email}".`, success: null }
  }

  const { error } = await supabase.from('profiles').update({ is_member: true }).eq('id', profile.id)
  if (error) return { error: error.message, success: null }

  revalidatePath('/admin/consultas')
  return { error: null, success: `Membresía activada para ${profile.name} (${profile.email}).` }
}
