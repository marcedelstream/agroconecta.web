'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

export type KnowledgeActionState = { error: string | null }

async function requireAdmin() {
  const auth = await getAuthContext()
  if (!auth) throw new Error('No tenés permiso para administrar la base de conocimiento.')
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
    const content = ((formData.get('content') as string) || '').trim() || null

    if (!title) return { error: 'El título es obligatorio.' }
    if (kind === 'link' && !url) return { error: 'Los links necesitan una URL.' }

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
