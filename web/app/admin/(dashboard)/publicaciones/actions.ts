'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'
import { sendPushToAll } from '@/lib/push'
import { slugify } from '@/lib/seo'

export type ActionState = { error: string | null }

const POST_IMAGES_BUCKET = 'post-images'
const MAX_IMAGE_SIZE = 8 * 1024 * 1024

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar publicaciones.')
  return auth
}

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

async function uploadFeaturedImage(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>) {
  const imageFile = formData.get('image_file')

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return (formData.get('image_url') as string) || null
  }

  if (!imageFile.type.startsWith('image/')) {
    throw new Error('La imagen destacada debe ser un archivo de imagen.')
  }

  if (imageFile.size > MAX_IMAGE_SIZE) {
    throw new Error('La imagen destacada no puede superar 8 MB.')
  }

  await supabase.storage.createBucket(POST_IMAGES_BUCKET, { public: true }).catch(() => null)

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const path = `featured/${year}/${month}/${randomUUID()}.${fileExtension(imageFile)}`
  const buffer = Buffer.from(await imageFile.arrayBuffer())

  const { error } = await supabase.storage
    .from(POST_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: imageFile.type,
      upsert: false,
    })

  if (error) throw new Error(`No se pudo subir la imagen destacada: ${error.message}`)

  const { data } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function uniqueSlug(supabase: ReturnType<typeof createSupabaseAdmin>, title: string) {
  const base = slugify(title) || 'noticia'
  let candidate = base
  let n = 1
  // Colisión de slug: se prueba con sufijo numérico en vez de pegar el uuid a la URL.
  while (true) {
    const { data } = await supabase.from('posts').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

async function extractPayload(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>) {
  const status = formData.get('editorial_status') as string
  const existingPublishedAt = formData.get('published_at') as string | null
  const targetDepartments = formData
    .getAll('target_departments')
    .map(String)
    .filter(Boolean)

  return {
    title: formData.get('title') as string,
    summary: (formData.get('summary') as string) || '',
    content: (formData.get('content') as string) || '',
    category: formData.get('category') as string,
    target_departments: targetDepartments,
    content_type: (formData.get('content_type') as string) || 'article',
    auction_status: (formData.get('auction_status') as string) || null,
    editorial_status: status,
    image_url: await uploadFeaturedImage(formData, supabase),
    youtube_url: (formData.get('youtube_url') as string) || null,
    is_important: formData.get('is_important') === 'on',
    is_highlighted: formData.get('is_highlighted') === 'on',
    organization_id: (formData.get('organization_id') as string) || null,
    published_at:
      status === 'published'
        ? (existingPublishedAt || new Date().toISOString())
        : null,
  }
}

export async function approvePost(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const supabase = createSupabaseAdmin()

  const { data: post } = await supabase
    .from('posts')
    .select('title, summary, is_important')
    .eq('id', id)
    .single()

  await supabase
    .from('posts')
    .update({ editorial_status: 'published', published_at: new Date().toISOString() })
    .eq('id', id)

  if (post?.is_important) {
    sendPushToAll({
      title: post.title,
      body: post.summary || 'Nueva publicación importante en Agroconecta.',
      data: { articleId: id },
    }, 'breakingNews').catch(() => null)
  }

  revalidatePath('/admin/publicaciones')
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function rejectPost(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const supabase = createSupabaseAdmin()
  await supabase
    .from('posts')
    .update({ editorial_status: 'rejected' })
    .eq('id', id)
  revalidatePath('/admin/publicaciones')
  revalidatePath('/admin')
}

export async function archivePost(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const supabase = createSupabaseAdmin()
  await supabase
    .from('posts')
    .update({ editorial_status: 'archived' })
    .eq('id', id)
  revalidatePath('/admin/publicaciones')
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deletePost(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const imageUrl = String(formData.get('image_url') ?? '')
  const supabase = createSupabaseAdmin()

  if (imageUrl.includes(`/${POST_IMAGES_BUCKET}/`)) {
    const path = imageUrl.split(`/${POST_IMAGES_BUCKET}/`)[1]
    await supabase.storage.from(POST_IMAGES_BUCKET).remove([path]).catch(() => null)
  }

  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) {
    console.error('No se pudo eliminar la publicación:', error.message)
    return
  }

  revalidatePath('/admin/publicaciones')
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function createPost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No tenés permiso.' }
  }

  const supabase = createSupabaseAdmin()
  let payload: Awaited<ReturnType<typeof extractPayload>>

  try {
    payload = await extractPayload(formData, supabase)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo preparar la publicación.' }
  }

  const slug = await uniqueSlug(supabase, payload.title)
  const { error } = await supabase.from('posts').insert({ ...payload, slug })
  if (error) return { error: error.message }

  revalidatePath('/admin/publicaciones')
  revalidatePath('/admin')
  revalidatePath('/')
  redirect('/admin/publicaciones')
}

export async function updatePost(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No tenés permiso.' }
  }

  const supabase = createSupabaseAdmin()
  let payload: Awaited<ReturnType<typeof extractPayload>>

  try {
    payload = await extractPayload(formData, supabase)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo preparar la publicación.' }
  }

  const { error, data: updated } = await supabase.from('posts').update(payload).eq('id', id).select('slug').maybeSingle()
  if (error) return { error: error.message }

  revalidatePath('/admin/publicaciones')
  revalidatePath('/admin')
  revalidatePath('/')
  if (updated?.slug) revalidatePath(`/noticias/${updated.slug}`)
  redirect('/admin/publicaciones')
}
