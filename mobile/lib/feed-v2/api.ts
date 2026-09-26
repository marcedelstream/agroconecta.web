import { supabase } from '@/lib/supabase'
import type { FeedPage } from './types'

// Mismo dominio que el resto de las llamadas a la web (delete-account, shorts, service-lead).
// EXPO_PUBLIC_WEB_BASE_URL permite apuntar a un deploy de preview de Vercel mientras /api/feed
// todavía no está en producción.
export const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_BASE_URL || 'https://agroconecta.com.py'

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
