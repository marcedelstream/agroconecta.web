'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

export type OrganizationActionState = { error: string | null }

const LOGOS_BUCKET = 'organization-logos'
const MAX_LOGO_SIZE = 4 * 1024 * 1024

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar organizaciones.')
  return auth
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

async function uploadLogo(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>) {
  const logoFile = formData.get('logo_file')
  if (!(logoFile instanceof File) || logoFile.size === 0) {
    return (formData.get('logo_url') as string) || null
  }

  if (!logoFile.type.startsWith('image/')) {
    throw new Error('El logo debe ser un archivo de imagen.')
  }

  if (logoFile.size > MAX_LOGO_SIZE) {
    throw new Error('El logo no puede superar 4 MB.')
  }

  await supabase.storage.createBucket(LOGOS_BUCKET, { public: true }).catch(() => null)

  const path = `profiles/${randomUUID()}.${fileExtension(logoFile)}`
  const buffer = Buffer.from(await logoFile.arrayBuffer())
  const { error } = await supabase.storage
    .from(LOGOS_BUCKET)
    .upload(path, buffer, {
      contentType: logoFile.type,
      upsert: false,
    })

  if (error) throw new Error(`No se pudo subir el logo: ${error.message}`)

  const { data } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function extractPayload(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>) {
  const name = ((formData.get('name') as string) || '').trim()
  const slug = ((formData.get('slug') as string) || slugify(name)).trim()

  if (!name) throw new Error('El nombre de la organización es obligatorio.')
  if (!slug) throw new Error('El slug es obligatorio.')

  return {
    name,
    slug,
    description: ((formData.get('description') as string) || '').trim(),
    type: formData.get('type') as string,
    commercial_status: formData.get('commercial_status') as string,
    plan_name: ((formData.get('plan_name') as string) || 'Piloto').trim(),
    is_verified: formData.get('is_verified') === 'on',
    logo_url: await uploadLogo(formData, supabase),
    events_organizer_slug: ((formData.get('events_organizer_slug') as string) || '').trim() || null,
    ally_plan: (formData.get('ally_plan') as string) || null,
    ally_category: (formData.get('ally_category') as string) || null,
    ally_founder: formData.get('ally_founder') === 'on',
    contact_phone: ((formData.get('contact_phone') as string) || '').trim() || null,
  }
}

export async function createOrganization(
  _prev: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  try {
    await requireAdmin()
    const supabase = createSupabaseAdmin()
    const payload = await extractPayload(formData, supabase)
    const { error } = await supabase.from('organizations').insert(payload)
    if (error) return { error: error.message }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo crear la organización.' }
  }

  revalidatePath('/admin/organizaciones')
  revalidatePath('/')
  redirect('/admin/organizaciones')
}

export async function updateOrganization(
  id: string,
  _prev: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  try {
    await requireAdmin()
    const supabase = createSupabaseAdmin()
    const payload = await extractPayload(formData, supabase)
    const { error } = await supabase.from('organizations').update(payload).eq('id', id)
    if (error) return { error: error.message }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo guardar la organización.' }
  }

  revalidatePath('/admin/organizaciones')
  revalidatePath(`/admin/organizaciones/${id}`)
  revalidatePath('/')
  redirect(`/admin/organizaciones/${id}`)
}

export async function deleteOrganization(
  _prev: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No tenés permiso.' }
  }

  const id = formData.get('id') as string
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('organizations').delete().eq('id', id)

  if (error) {
    // organizations.id tiene "on delete restrict" desde posts — no se puede borrar si
    // tiene publicaciones asociadas.
    if (error.code === '23503') {
      return { error: 'No se puede eliminar: esta organización tiene publicaciones asociadas. Archivalas o reasignalas primero.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/organizaciones')
  revalidatePath('/')
  redirect('/admin/organizaciones')
}
