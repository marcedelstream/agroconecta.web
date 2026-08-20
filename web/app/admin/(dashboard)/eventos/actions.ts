'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

const EVENT_MEDIA_BUCKET = 'event-media'
const MAX_IMAGE_SIZE = 8 * 1024 * 1024

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar eventos.')
}

async function uploadEventImage(
  file: FormDataEntryValue | null,
  supabase: ReturnType<typeof createSupabaseAdmin>,
  prefix: 'profile' | 'banner'
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null
  if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE) {
    console.error(`Imagen de evento (${prefix}) inválida: tipo o tamaño fuera de rango.`)
    return null
  }

  await supabase.storage.createBucket(EVENT_MEDIA_BUCKET, { public: true }).catch(() => null)

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${prefix}/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from(EVENT_MEDIA_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error(`No se pudo subir la imagen de evento (${prefix}):`, error.message)
    return null
  }

  const { data } = supabase.storage.from(EVENT_MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function saveEventMedia(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const eventSlug = String(formData.get('event_slug') ?? '').trim()
  if (!eventSlug) return

  const [profileUrl, bannerUrl] = await Promise.all([
    uploadEventImage(formData.get('profile_image_file'), supabase, 'profile'),
    uploadEventImage(formData.get('banner_image_file'), supabase, 'banner'),
  ])

  const existingProfileUrl = String(formData.get('existing_profile_url') ?? '').trim() || null
  const existingBannerUrl = String(formData.get('existing_banner_url') ?? '').trim() || null
  const isActive = formData.get('is_active') === 'on'

  await supabase.from('event_media').upsert(
    {
      event_slug: eventSlug,
      profile_image_url: profileUrl ?? existingProfileUrl,
      banner_image_url: bannerUrl ?? existingBannerUrl,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'event_slug' }
  )

  revalidatePath('/admin/eventos')
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
