import { supabase } from '@/lib/supabase'
import type { FeedPage } from './types'

// Con www a propósito: agroconecta.com.py redirige (308) a www, y en esa redirección el celular
// descarta el header Authorization → la API respondería 401 (delete-account lo esquiva mandando el
// token también en el body). EXPO_PUBLIC_WEB_BASE_URL permite apuntar a otro deploy para pruebas.
export const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_BASE_URL || 'https://www.agroconecta.com.py'

export class FeedAuthError extends Error {}

export async function fetchFeedPage(cursor: string | null, limit = 10): Promise<FeedPage> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new FeedAuthError('Sin sesión')

  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)

  const res = await fetch(`${WEB_BASE_URL}/api/feed?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new FeedAuthError('Sesión inválida')
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`)
  return (await res.json()) as FeedPage
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}
