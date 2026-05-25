'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

function csv(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar banners.')
}

export async function createBanner(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()

  await supabase.from('ad_campaigns').insert({
    title: String(formData.get('title') ?? ''),
    image_url: String(formData.get('image_url') ?? ''),
    target_professions: csv(formData.get('target_professions')),
    target_departments: formData.getAll('target_departments').map(String).filter(Boolean),
    target_categories: formData.getAll('target_categories').map(String).filter(Boolean),
    is_active: formData.get('is_active') === 'on',
  })

  revalidatePath('/admin/banners')
}

export async function toggleBanner(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const isActive = formData.get('is_active') === 'true'

  await supabase
    .from('ad_campaigns')
    .update({ is_active: !isActive })
    .eq('id', id)

  revalidatePath('/admin/banners')
}
