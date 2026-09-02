'use server'

import { revalidatePath } from 'next/cache'
import mammoth from 'mammoth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'
import type { KaraiSourceStatus } from '@/lib/karai/knowledge-types'

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

function optionalText(formData: FormData, key: string): string | null {
  return ((formData.get(key) as string) || '').trim() || null
}

function optionalDate(formData: FormData, key: string): string | null {
  const raw = (formData.get(key) as string) || ''
  return raw.trim() || null
}

export async function createKnowledgeSource(
  _prev: KnowledgeActionState,
  formData: FormData,
): Promise<KnowledgeActionState> {
  try {
    await requireAdmin()
    const kind = formData.get('kind') as string
    const title = ((formData.get('title') as string) || '').trim()
    const url = optionalText(formData, 'url')

    if (!title) return { error: 'El título es obligatorio.' }
    if (kind === 'link' && !url) return { error: 'Los links necesitan una URL.' }

    // El documento puede venir pegado a mano (content) o como .docx (docx_file, se extrae con
    // mammoth) — si vienen los dos, gana el archivo.
    const docxText = await extractDocxText(formData)
    const pastedContent = optionalText(formData, 'content')
    const content = docxText ?? pastedContent

    // Nueva fuente siempre arranca en "pendiente" — que alguien la revise y la apruebe a mano es
    // justo el punto del flujo editorial (KARAI-PLAN-ENTRENAMIENTO-Y-FUENTES.md secc. 5,
    // "Documentos cargados por el equipo": Borrador → revisión → aprobación → indexación).
    const admin = createSupabaseAdmin()
    const { error } = await admin.from('karai_knowledge_sources').insert({
      kind,
      title,
      url,
      content,
      publisher: optionalText(formData, 'publisher'),
      source_level: optionalText(formData, 'source_level'),
      topic: optionalText(formData, 'topic'),
      geography: optionalText(formData, 'geography') ?? 'Paraguay',
      issued_at: optionalDate(formData, 'issued_at'),
      expires_at: optionalDate(formData, 'expires_at'),
      verification_notes: optionalText(formData, 'verification_notes'),
      status: 'pendiente',
    })
    if (error) return { error: error.message }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo guardar.' }
  }

  revalidatePath('/admin/karai/fuentes')
  return { error: null }
}

export async function setKnowledgeSourceStatus(id: string, status: KaraiSourceStatus) {
  await requireAdmin()
  const admin = createSupabaseAdmin()
  const patch: Record<string, unknown> = { status }
  if (status === 'aprobado') patch.reviewed_at = new Date().toISOString().slice(0, 10)
  await admin.from('karai_knowledge_sources').update(patch).eq('id', id)
  revalidatePath('/admin/karai/fuentes')
}

export async function deleteKnowledgeSource(id: string) {
  await requireAdmin()
  const admin = createSupabaseAdmin()
  await admin.from('karai_knowledge_sources').delete().eq('id', id)
  revalidatePath('/admin/karai/fuentes')
}
