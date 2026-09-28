import { NextResponse } from 'next/server'
import { authenticateOptional } from '@/lib/feed/guest-auth'
import { buildFeedItem, isFeedSource } from '@/lib/feed/item'

export const dynamic = 'force-dynamic'

const MAX_ID_LENGTH = 120

// Una publicación suelta, con el estado del usuario (me gusta, guardado, sigue). La usa la app cuando
// se abre desde un link compartido (agroconecta://p/<source>/<id>). Funciona también sin sesión.
export async function GET(request: Request) {
  const auth = await authenticateOptional(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const params = new URL(request.url).searchParams
  const source = params.get('source') ?? ''
  const id = (params.get('id') ?? '').slice(0, MAX_ID_LENGTH)
  if (!isFeedSource(source) || !id) return NextResponse.json({ error: 'Publicación inválida.' }, { status: 400 })

  try {
    const item = await buildFeedItem(auth.admin, auth.userId, source, id)
    if (!item) return NextResponse.json({ error: 'No encontramos esa publicación.' }, { status: 404 })
    return NextResponse.json({ item }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('GET /api/item falló:', err)
    return NextResponse.json({ error: 'No pudimos cargar la publicación.' }, { status: 500 })
  }
}
