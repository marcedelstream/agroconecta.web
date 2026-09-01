'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

export async function updateLeadStatus(id: string, status: 'new' | 'contacted' | 'closed') {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar leads de Karai.')

  const admin = createSupabaseAdmin()
  const { error } = await admin.from('karai_leads').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/karai')
  revalidatePath(`/admin/karai/leads/${id}`)
}
