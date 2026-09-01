'use server'

import { revalidatePath } from 'next/cache'
import mammoth from 'mammoth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

export type KnowledgeActionState = { error: string | null }

const MAX_DOCX_SIZE = 8 * 1024 * 1024

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar la base de conocimiento.')
}

async function extractDocxText(formData: FormData): Promise<string | null> {
  const file = formData.get('docx_file')
  if (!(file instanceof File) || file.size === 0) return null

  if (file.size > MAX_DOCX_SIZE) throw new Error('El documento no puede superar 8 MB.')
  if (!file.name.toLowerCase().endsWith('.docx')) throw new Error('Solo se acepta formato .docx.')

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await mammoth.extractRawText({ buffer })
  const text = result.value.trim()
  if (!text) throw new Error('No se pudo extraer texto del documento.')
  return text
}

export async function createKnowledgeSource(
  _prev: KnowledgeActionState,
  formData: FormData,
): Promise<KnowledgeActionState> {
  try {
    await requireAdmin()
    const kind = formData.get('kind') as string
    const title = ((formData.get('title') as string) || '').trim()
    const url = ((formData.get('url') as string) || '').trim() || null

    if (!title) return { error: 'El título es obligatorio.' }
    if (kind === 'link' && !url) return { error: 'Los links necesitan una URL.' }

    // El documento puede venir pegado a mano (content) o como .docx (docx_file, se extrae con
    // mammoth) — si vienen los dos, gana el archivo.
    const docxText = await extractDocxText(formData)
    const pastedContent = ((formData.get('content') as string) || '').trim() || null
    const content = docxText ?? pastedContent

    const admin = createSupabaseAdmin()
    const { error } = await admin.from('karai_knowledge_sources').insert({ kind, title, url, content })
    if (error) return { error: error.message }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo guardar.' }
  }

  revalidatePath('/admin/karai/fuentes')
  return { error: null }
}

export async function toggleKnowledgeSource(id: string, isActive: boolean) {
  await requireAdmin()
  const admin = createSupabaseAdmin()
  await admin.from('karai_knowledge_sources').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/karai/fuentes')
}

export async function deleteKnowledgeSource(id: string) {
  await requireAdmin()
  const admin = createSupabaseAdmin()
  await admin.from('karai_knowledge_sources').delete().eq('id', id)
  revalidatePath('/admin/karai/fuentes')
}
