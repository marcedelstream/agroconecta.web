'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'

const SOURCES = ['event', 'post'] as const

async function requireAdmin() {
  if (!(await getAuthContext())) throw new Error('No tenés permiso para administrar transmisiones.')
}

// Alta de una transmisión (queda apagada hasta que se la prenda: así se puede cargar antes).
export async function createLiveSession(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  const streamUrl = String(formData.get('stream_url') ?? '').trim()
  if (!title || !/^https?:\/\//.test(streamUrl)) throw new Error('Título y enlace de la transmisión son obligatorios.')
  const source = String(formData.get('source') ?? '')
  const sourceId = String(formData.get('source_id') ?? '').trim()

  const { error } = await createSupabaseAdmin().from('live_sessions').insert({
    title,
    stream_url: streamUrl,
    subtitle: String(formData.get('subtitle') ?? '').trim() || null,
    image_url: String(formData.get('image_url') ?? '').trim() || null,
    source: (SOURCES as readonly string[]).includes(source) && sourceId ? source : null,
    source_id: (SOURCES as readonly string[]).includes(source) && sourceId ? sourceId : null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/en-vivo')
}

export async function toggleLiveSession(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const turnOn = formData.get('is_live') !== 'true'
  const now = new Date().toISOString()
  await createSupabaseAdmin()
    .from('live_sessions')
    .update(turnOn ? { is_live: true, started_at: now, ended_at: null } : { is_live: false, ended_at: now })
    .eq('id', id)
  revalidatePath('/admin/en-vivo')
}

// El dato en vivo del aviso ("Lote 12/40 · 1.284 conectados") se actualiza a mano durante la transmisión.
export async function updateLiveSubtitle(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  await createSupabaseAdmin()
    .from('live_sessions')
    .update({ subtitle: String(formData.get('subtitle') ?? '').trim() || null })
    .eq('id', id)
  revalidatePath('/admin/en-vivo')
}

export async function deleteLiveSession(formData: FormData) {
  await requireAdmin()
  await createSupabaseAdmin().from('live_sessions').delete().eq('id', String(formData.get('id') ?? ''))
  revalidatePath('/admin/en-vivo')
}
