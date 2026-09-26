import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { buildKaraiRefs } from '@/lib/feed/service'

export const dynamic = 'force-dynamic'

const MAX_MESSAGE_LENGTH = 500

// Tarjetas de contenido de Agroconecta dentro de las respuestas de Karai (README §3.4: Karai es otra
// forma de navegar el contenido). La app lo pide en paralelo a /api/karai/chat: es una búsqueda sobre
// el mismo contenido del feed, no gasta tokens de IA ni toca el orquestador.
export async function POST(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message.slice(0, MAX_MESSAGE_LENGTH) : ''
  if (!message.trim()) return NextResponse.json({ refs: [] })

  try {
    const refs = await buildKaraiRefs(auth.admin, auth.profileId, message)
    return NextResponse.json({ refs }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('POST /api/karai/refs falló:', err)
    return NextResponse.json({ refs: [] })
  }
}
