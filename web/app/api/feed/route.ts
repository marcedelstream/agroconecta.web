import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { buildFeedPage, decodeCursor, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/feed/service'

export const dynamic = 'force-dynamic'

// Feed v2 de la app mobile. El orden se decide acá (no en el cliente) y combina la base principal
// con la base externa de eventos. Auth: JWT de Supabase por Bearer, mismo helper que Karai.
export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const params = new URL(request.url).searchParams
  const rawCursor = params.get('cursor')
  const cursor = decodeCursor(rawCursor)
  if (rawCursor && !cursor) return NextResponse.json({ error: 'Cursor inválido.' }, { status: 400 })

  const requested = Number(params.get('limit') ?? DEFAULT_PAGE_SIZE)
  const pageSize = Number.isFinite(requested) ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(requested))) : DEFAULT_PAGE_SIZE

  try {
    const page = await buildFeedPage(auth.admin, auth.profileId, cursor, pageSize)
    return NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('GET /api/feed falló:', err)
    return NextResponse.json({ error: 'No pudimos cargar el feed.' }, { status: 500 })
  }
}
