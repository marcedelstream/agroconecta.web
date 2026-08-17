'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'
import type { EcosystemListingKind } from '@/lib/types'

export type EcosystemListingActionState = { error: string | null }

const IMAGES_BUCKET = 'ecosystem-listings'
const MAX_IMAGE_SIZE = 4 * 1024 * 1024

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar el ecosistema.')
  return auth
}

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

async function uploadImage(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>) {
  const file = formData.get('image_file')
  if (!(file instanceof File) || file.size === 0) {
    return (formData.get('image_url') as string)?.trim() || null
  }

  if (!file.type.startsWith('image/')) throw new Error('La imagen debe ser un archivo de imagen.')
  if (file.size > MAX_IMAGE_SIZE) throw new Error('La imagen no puede superar 4 MB.')

  await supabase.storage.createBucket(IMAGES_BUCKET, { public: true }).catch(() => null)

  const path = `${randomUUID()}.${fileExtension(file)}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`)

  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function extractPayload(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>) {
  const title = ((formData.get('title') as string) || '').trim()
  if (!title) throw new Error('El título es obligatorio.')

  const location = ((formData.get('location') as string) || '').trim()
  if (!location) throw new Error('La ubicación es obligatoria.')

  const modality = ((formData.get('modality') as string) || '').trim()
  if (!modality) throw new Error('La modalidad es obligatoria.')

  const description = ((formData.get('description') as string) || '').trim()
  if (!description) throw new Error('La descripción es obligatoria.')

  const categoryLabel = ((formData.get('category_label') as string) || '').trim()
  if (!categoryLabel) throw new Error('La categoría es obligatoria.')

  const publisherName = ((formData.get('publisher_name') as string) || '').trim()
  if (!publisherName) throw new Error('El nombre de quien publica es obligatorio.')

  return {
    kind: formData.get('kind') as EcosystemListingKind,
    title,
    location,
    modality,
    description,
    category_label: categoryLabel,
    publisher_name: publisherName,
    contact_url: ((formData.get('contact_url') as string) || '').trim() || null,
    image_url: await uploadImage(formData, supabase),
    is_active: formData.get('is_active') === 'on',
  }
}

export async function createListing(
  _prev: EcosystemListingActionState,
  formData: FormData,
): Promise<EcosystemListingActionState> {
  try {
    await requireAdmin()
    const supabase = createSupabaseAdmin()
    const payload = await extractPayload(formData, supabase)
    const { error } = await supabase.from('ecosystem_listings').insert(payload)
    if (error) return { error: error.message }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo crear la publicación.' }
  }

  revalidatePath('/admin/ecosistema')
  redirect('/admin/ecosistema')
}

export async function updateListing(
  id: string,
  _prev: EcosystemListingActionState,
  formData: FormData,
): Promise<EcosystemListingActionState> {
  try {
    await requireAdmin()
    const supabase = createSupabaseAdmin()
    const payload = await extractPayload(formData, supabase)
    const { error } = await supabase.from('ecosystem_listings').update(payload).eq('id', id)
    if (error) return { error: error.message }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo guardar la publicación.' }
  }

  revalidatePath('/admin/ecosistema')
  redirect('/admin/ecosistema')
}

export async function deleteListing(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const imageUrl = String(formData.get('image_url') ?? '')

  if (imageUrl.includes(`/${IMAGES_BUCKET}/`)) {
    const path = imageUrl.split(`/${IMAGES_BUCKET}/`)[1]
    await supabase.storage.from(IMAGES_BUCKET).remove([path]).catch(() => null)
  }

  await supabase.from('ecosystem_listings').delete().eq('id', id)
  revalidatePath('/admin/ecosistema')
  redirect('/admin/ecosistema')
}

export async function toggleActive(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const isActive = formData.get('is_active') === 'true'

  await supabase.from('ecosystem_listings').update({ is_active: !isActive }).eq('id', id)
  revalidatePath('/admin/ecosistema')
}
