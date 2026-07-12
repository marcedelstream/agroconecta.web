'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

export type LibraryActionState = { error: string | null }

const COVERS_BUCKET = 'library-covers'
const FILES_BUCKET = 'library-files'
const MAX_COVER_SIZE = 4 * 1024 * 1024
const MAX_FILE_SIZE = 30 * 1024 * 1024

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar la biblioteca.')
}

function fileExtension(file: File, fallback: string) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  return fromName && /^[a-z0-9]+$/.test(fromName) ? fromName : fallback
}

async function uploadCover(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>): Promise<string> {
  const file = formData.get('cover_file')
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Seleccioná una portada para el título.')
  }
  if (!file.type.startsWith('image/')) throw new Error('La portada debe ser una imagen.')
  if (file.size > MAX_COVER_SIZE) throw new Error('La portada no puede superar 4 MB.')

  await supabase.storage.createBucket(COVERS_BUCKET, { public: true }).catch(() => null)
  const path = `${randomUUID()}.${fileExtension(file, 'jpg')}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, buffer, { contentType: file.type, upsert: false })
  if (error) throw new Error(`No se pudo subir la portada: ${error.message}`)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function uploadFile(formData: FormData, supabase: ReturnType<typeof createSupabaseAdmin>): Promise<{ url: string; type: string }> {
  const file = formData.get('item_file')
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Seleccioná el archivo (PDF) del título.')
  }
  if (file.size > MAX_FILE_SIZE) throw new Error('El archivo no puede superar 30 MB.')

  await supabase.storage.createBucket(FILES_BUCKET, { public: false }).catch(() => null)
  const ext = fileExtension(file, 'pdf')
  const path = `${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, buffer, { contentType: file.type || 'application/pdf', upsert: false })
  if (error) throw new Error(`No se pudo subir el archivo: ${error.message}`)

  // Bucket privado: se guarda el path, la app pide una URL firmada al momento de leer.
  return { url: path, type: ext }
}

export async function createLibraryItem(
  _prev: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No tenés permiso.' }
  }

  const title = String(formData.get('title') ?? '').trim()
  if (!title) return { error: 'El título es obligatorio.' }
  const description = String(formData.get('description') ?? '').trim()
  if (!description) return { error: 'La descripción es obligatoria.' }

  const supabase = createSupabaseAdmin()
  let coverUrl: string
  let file: { url: string; type: string }
  try {
    coverUrl = await uploadCover(formData, supabase)
    file = await uploadFile(formData, supabase)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo preparar el título.' }
  }

  const pageCount = String(formData.get('page_count') ?? '').trim()

  const { error } = await supabase.from('library_items').insert({
    title,
    author: (String(formData.get('author') ?? '').trim() || null),
    description,
    category: formData.get('category') as string,
    cover_image_url: coverUrl,
    file_url: file.url,
    file_type: file.type,
    page_count: pageCount ? Number(pageCount) : null,
    is_published: formData.get('is_published') === 'on',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/biblioteca')
  return { error: null }
}

export async function togglePublished(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const isPublished = formData.get('is_published') === 'true'

  await supabase.from('library_items').update({ is_published: !isPublished }).eq('id', id)
  revalidatePath('/admin/biblioteca')
}

export async function deleteLibraryItem(formData: FormData) {
  await requireAdmin()
  const supabase = createSupabaseAdmin()
  const id = String(formData.get('id') ?? '')
  const coverUrl = String(formData.get('cover_image_url') ?? '')
  const fileUrl = String(formData.get('file_url') ?? '')

  if (coverUrl.includes(`/${COVERS_BUCKET}/`)) {
    const path = coverUrl.split(`/${COVERS_BUCKET}/`)[1]
    await supabase.storage.from(COVERS_BUCKET).remove([path]).catch(() => null)
  }
  if (fileUrl) {
    await supabase.storage.from(FILES_BUCKET).remove([fileUrl]).catch(() => null)
  }

  await supabase.from('library_items').delete().eq('id', id)
  revalidatePath('/admin/biblioteca')
}
