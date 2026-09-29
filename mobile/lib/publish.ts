import { router } from 'expo-router'
import { supabase } from './supabase'
import { WEB_BASE_URL } from './feed-v2/api'
import { requireSession } from './feed-v2/guest'

// Publicar desde la app: solo organizaciones con plan vigente (web/app/api/publish). Lo que se manda
// queda "En revisión" hasta que el equipo lo aprueba en el panel.

export interface PublishingOrg {
  id: string
  name: string
  logoUrl: string | null
}

export type PostKind = 'article' | 'video'

export interface NewPost {
  organizationId: string
  type: PostKind
  title: string
  summary: string
  content: string
  category: string
  youtubeUrl?: string
  imageBase64?: string
  imageType?: string
}

async function headers(): Promise<Record<string, string> | null> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null
}

export async function fetchPublishingOrgs(): Promise<PublishingOrg[]> {
  const h = await headers()
  if (!h) return []
  const res = await fetch(`${WEB_BASE_URL}/api/publish`, { headers: h })
  if (!res.ok) throw new Error(`publish HTTP ${res.status}`)
  return ((await res.json()) as { organizations: PublishingOrg[] }).organizations
}

export async function submitPost(post: NewPost): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await headers()
  if (!h) return { ok: false, error: '' }
  try {
    const res = await fetch(`${WEB_BASE_URL}/api/publish`, { method: 'POST', headers: h, body: JSON.stringify(post) })
    if (res.ok) return { ok: true }
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    return { ok: false, error: body?.error ?? '' }
  } catch {
    return { ok: false, error: '' }
  }
}

/** Botón "+": organizaciones con plan van al formulario; el resto ve cómo publicar en Agroconecta. */
export async function openPublish() {
  if (!(await requireSession())) return
  const orgs = await fetchPublishingOrgs().catch(() => [])
  router.push((orgs.length > 0 ? '/(main)/publicar' : '/(main)/publicar-info') as never)
}
