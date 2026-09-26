import { supabase } from '@/lib/supabase'
import type { ExploreFilters, ExplorePage, FeedPage, GuardadosPage, LiveItem } from './types'

// Con www a propósito: agroconecta.com.py redirige (308) a www, y en esa redirección el celular
// descarta el header Authorization → la API respondería 401 (delete-account lo esquiva mandando el
// token también en el body). EXPO_PUBLIC_WEB_BASE_URL permite apuntar a otro deploy para pruebas.
export const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_BASE_URL || 'https://www.agroconecta.com.py'

export class FeedAuthError extends Error {}

async function authorizedGet<T>(path: string, params: URLSearchParams): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new FeedAuthError('Sin sesión')
  const res = await fetch(`${WEB_BASE_URL}${path}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new FeedAuthError('Sesión inválida')
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`)
  return (await res.json()) as T
}

/** `seen`: claves ya mostradas en la sesión; el servidor las manda al final (ver /api/feed). */
export async function fetchFeedPage(cursor: string | null, seen: string[], limit = 10): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)
  if (seen.length > 0) params.set('seen', seen.join(','))
  return authorizedGet<FeedPage>('/api/feed', params)
}

export async function fetchExplore(filters: ExploreFilters): Promise<ExplorePage> {
  const params = new URLSearchParams()
  if (filters.query.trim()) params.set('q', filters.query.trim())
  if (filters.type) params.set('type', filters.type)
  if (filters.rubro) params.set('rubro', filters.rubro)
  return authorizedGet<ExplorePage>('/api/explore', params)
}

export async function fetchGuardados(): Promise<GuardadosPage> {
  return authorizedGet<GuardadosPage>('/api/guardados', new URLSearchParams())
}

export async function fetchLive(): Promise<LiveItem[]> {
  const body = await authorizedGet<{ live: LiveItem[] }>('/api/live', new URLSearchParams())
  return body.live
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}
