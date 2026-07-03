'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar eventos.')
}

export async function addScheduleItem(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const eventSlug = String(formData.get('event_slug') ?? '').trim()
  if (!eventSlug) return

  await supabase.from('event_schedule_items').insert({
    event_slug: eventSlug,
    day_label: String(formData.get('day_label') ?? '').trim() || null,
    time: String(formData.get('time') ?? '').trim() || null,
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim() || null,
    speaker: String(formData.get('speaker') ?? '').trim() || null,
    order_index: Number(formData.get('order_index') ?? 0) || 0,
  })

  revalidatePath('/admin/eventos')
}

export async function deleteScheduleItem(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  await supabase.from('event_schedule_items').delete().eq('id', id)
  revalidatePath('/admin/eventos')
}

export async function tagPostToEvent(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const postId = String(formData.get('post_id') ?? '')
  const eventSlug = String(formData.get('event_slug') ?? '').trim() || null
  if (!postId) return

  await supabase.from('posts').update({ event_tag: eventSlug }).eq('id', postId)
  revalidatePath('/admin/eventos')
  revalidatePath('/admin/publicaciones')
}
