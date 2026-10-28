import { NextResponse } from 'next/server'
import { authenticateOptional } from '@/lib/feed/guest-auth'
import { buildAllyPage } from '@/lib/feed/ally'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Página de un aliado en la app v2: eventos, noticias y cursos (propios + los que anexa el equipo). Se ve sin
// iniciar sesión, igual que el feed.
export async function GET(request: Request) {
  const auth = await authenticateOptional(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!UUID.test(id)) return NextResponse.json({ error: 'Aliado inválido.' }, { status: 400 })

  try {
    const page = await buildAllyPage(auth.admin, id, auth.userId)
    return NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('GET /api/aliado falló:', err)
    return NextResponse.json({ error: 'No pudimos cargar la página del aliado.' }, { status: 500 })
  }
}
