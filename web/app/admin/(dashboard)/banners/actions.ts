'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

const BANNERS_BUCKET = 'banners'
const MAX_SIZE = 8 * 1024 * 1024

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

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

async function uploadBannerImage(formData: FormData): Promise<string> {
  const file = formData.get('image_file')

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Seleccioná una imagen para el banner.')
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('La imagen no puede superar 8 MB.')
  }

  const supabase = createSupabaseAdmin()
  await supabase.storage.createBucket(BANNERS_BUCKET, { public: true }).catch(() => null)

  const path = `campaigns/${randomUUID()}.${fileExtension(file)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from(BANNERS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`)

  const { data } = supabase.storage.from(BANNERS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createBanner(formData: FormData) {
  await requireAdmin()

  let imageUrl: string
  try {
    imageUrl = await uploadBannerImage(formData)
  } catch (err) {
    // Si falla la subida retornamos silenciosamente (el form mostrará el error en futura iteración)
    console.error(err)
    return
  }

  const supabase = createSupabaseAdmin()
  await supabase.from('ad_campaigns').insert({
    title: String(formData.get('title') ?? ''),
    image_url: imageUrl,
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

export async function deleteBanner(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const imageUrl = String(formData.get('image_url') ?? '')

  // Borrar archivo del storage si es un upload propio
  if (imageUrl.includes(`/${BANNERS_BUCKET}/`)) {
    const path = imageUrl.split(`/${BANNERS_BUCKET}/`)[1]
    await supabase.storage.from(BANNERS_BUCKET).remove([path]).catch(() => null)
  }

  await supabase.from('ad_campaigns').delete().eq('id', id)
  revalidatePath('/admin/banners')
}
