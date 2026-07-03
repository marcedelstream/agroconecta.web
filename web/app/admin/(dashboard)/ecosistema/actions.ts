'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

const LOGOS_BUCKET = 'ecosystem-logos'
const MAX_SIZE = 4 * 1024 * 1024

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar el ecosistema.')
}

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

async function uploadLogo(formData: FormData): Promise<string | null> {
  const file = formData.get('logo_file')
  if (!(file instanceof File) || file.size === 0) return null
  if (!file.type.startsWith('image/')) throw new Error('El logo debe ser una imagen.')
  if (file.size > MAX_SIZE) throw new Error('El logo no puede superar 4 MB.')

  const supabase = createSupabaseAdmin()
  await supabase.storage.createBucket(LOGOS_BUCKET, { public: true }).catch(() => null)

  const path = `sites/${randomUUID()}.${fileExtension(file)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from(LOGOS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(`No se pudo subir el logo: ${error.message}`)

  const { data } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createEcosystemSite(formData: FormData) {
  await requireAdmin()

  let logoUrl: string | null
  try {
    logoUrl = await uploadLogo(formData)
  } catch (err) {
    console.error(err)
    return
  }

  const supabase = createSupabaseAdmin()
  await supabase.from('ecosystem_sites').insert({
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    url: String(formData.get('url') ?? '') || null,
    logo_url: logoUrl,
    category: String(formData.get('category') ?? 'institucional'),
    is_available: formData.get('is_available') === 'on',
    order_index: Number(formData.get('order_index') ?? 0) || 0,
  })

  revalidatePath('/admin/ecosistema')
}

export async function toggleEcosystemSite(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const isAvailable = formData.get('is_available') === 'true'

  await supabase.from('ecosystem_sites').update({ is_available: !isAvailable }).eq('id', id)
  revalidatePath('/admin/ecosistema')
}

export async function deleteEcosystemSite(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const logoUrl = String(formData.get('logo_url') ?? '')

  if (logoUrl.includes(`/${LOGOS_BUCKET}/`)) {
    const path = logoUrl.split(`/${LOGOS_BUCKET}/`)[1]
    await supabase.storage.from(LOGOS_BUCKET).remove([path]).catch(() => null)
  }

  await supabase.from('ecosystem_sites').delete().eq('id', id)
  revalidatePath('/admin/ecosistema')
}
