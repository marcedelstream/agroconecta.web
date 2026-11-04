'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'
import { backWithError, backWithOk } from '@/lib/admin-feedback'

// Portadas del perfil de la app (supabase/fix-v2-profile-covers.sql). Las imágenes van al bucket de banners.
const BUCKET = 'banners'
const MAX_SIZE = 8 * 1024 * 1024
const PATH = '/admin/portadas'

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar portadas.')
}

export async function createCover(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  const file = formData.get('image_file')
  if (!title) backWithError(PATH, 'Poné un nombre para la portada.')
  if (!(file instanceof File) || file.size === 0 || !file.type.startsWith('image/')) backWithError(PATH, 'Elegí una imagen.')
  if (file.size > MAX_SIZE) backWithError(PATH, 'La imagen no puede superar 8 MB.')

  const supabase = createSupabaseAdmin()
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `covers/${randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (uploadError) backWithError(PATH, `No se pudo subir la imagen: ${uploadError.message}`)
  const imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

  const order = Math.round(Number(formData.get('sort_order')))
  const { error } = await supabase.from('profile_covers').insert({
    title,
    image_url: imageUrl,
    sort_order: Number.isFinite(order) && order > 0 ? order : 100,
  })
  if (error) backWithError(PATH, `No se pudo guardar. ¿Ya corriste fix-v2-profile-covers.sql? (${error.message})`)
  revalidatePath(PATH)
  backWithOk(PATH, 'Portada cargada. Ya se puede elegir en el Perfil de la app.')
}

export async function toggleCover(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const isActive = formData.get('is_active') === 'true'
  await createSupabaseAdmin().from('profile_covers').update({ is_active: !isActive }).eq('id', id)
  revalidatePath(PATH)
}

export async function setCoverOrder(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const order = Math.round(Number(formData.get('sort_order')))
  if (!id || !Number.isFinite(order)) return
  await createSupabaseAdmin().from('profile_covers').update({ sort_order: order }).eq('id', id)
  revalidatePath(PATH)
}

/** Quien la tenía elegida vuelve a la portada de Agroconecta (on delete set null). */
export async function deleteCover(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const imageUrl = String(formData.get('image_url') ?? '')
  const supabase = createSupabaseAdmin()
  await supabase.from('profile_covers').delete().eq('id', id)
  if (imageUrl.includes(`/${BUCKET}/`)) await supabase.storage.from(BUCKET).remove([imageUrl.split(`/${BUCKET}/`)[1]]).catch(() => null)
  revalidatePath(PATH)
}
