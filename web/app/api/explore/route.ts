import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { EXPLORE_RUBROS, EXPLORE_TYPES } from '@/lib/feed/explore'
import { buildExplorePage } from '@/lib/feed/service'
import type { FeedContentType } from '@/lib/feed/types'

export const dynamic = 'force-dynamic'

const MAX_QUERY_LENGTH = 80

// Explorar de la app v2: búsqueda + filtro por tipo y rubro + tendencias. Mismo contenido y mismo
// orden que /api/feed. Auth: JWT de Supabase por Bearer.
export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const params = new URL(request.url).searchParams
  const rawType = params.get('type')
  const rawRubro = params.get('rubro')
  const type = EXPLORE_TYPES.includes(rawType as FeedContentType) ? (rawType as FeedContentType) : null
  const rubro = rawRubro && (EXPLORE_RUBROS as readonly string[]).includes(rawRubro) ? rawRubro : null
  const query = (params.get('q') ?? '').slice(0, MAX_QUERY_LENGTH)

  try {
    const page = await buildExplorePage(auth.admin, auth.profileId, { query, type, rubro })
    return NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('GET /api/explore falló:', err)
    return NextResponse.json({ error: 'No pudimos cargar Explorar.' }, { status: 500 })
  }
}
