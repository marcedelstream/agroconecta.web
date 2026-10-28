'use server'

import { revalidatePath } from 'next/cache'
import { backWithError, backWithOk } from '@/lib/admin-feedback'
import { getAuthContext } from '@/lib/auth-roles'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

// Contenido anexado a la página de un aliado en la app (organization_content, fix-v2-ally-content.sql).

const KEY = /^(post|listing|library|event):.+$/

async function requireAdmin() {
  if (!(await getAuthContext())) throw new Error('No tenés permiso para administrar organizaciones.')
}

export async function addAllyContent(formData: FormData) {
  await requireAdmin()
  const orgId = String(formData.get('organization_id') ?? '')
  const key = String(formData.get('content_key') ?? '')
  const back = `/admin/organizaciones/${orgId}`
  if (!KEY.test(key)) backWithError(back, 'Elegí qué querés anexar.')

  const db = createSupabaseAdmin()
  const { count } = await db.from('organization_content').select('content_key', { count: 'exact', head: true }).eq('organization_id', orgId)
  const { error } = await db.from('organization_content').insert({ organization_id: orgId, content_key: key, position: (count ?? 0) + 1 })
  if (error?.code === '23505') backWithError(back, 'Eso ya está anexado a este aliado.')
  if (error) backWithError(back, `No se pudo anexar: ${error.message}. ¿Ya se corrió fix-v2-ally-content.sql?`)
  revalidatePath(back)
  backWithOk(back, 'Anexado. Ya aparece en la página del aliado en la app.')
}

export async function removeAllyContent(formData: FormData) {
  await requireAdmin()
  const orgId = String(formData.get('organization_id') ?? '')
  const key = String(formData.get('content_key') ?? '')
  await createSupabaseAdmin().from('organization_content').delete().eq('organization_id', orgId).eq('content_key', key)
  const back = `/admin/organizaciones/${orgId}`
  revalidatePath(back)
  backWithOk(back, 'Quitado de la página del aliado.')
}
