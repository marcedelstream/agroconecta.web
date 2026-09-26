import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { loadLive } from '@/lib/feed/live'

export const dynamic = 'force-dynamic'

// Transmisiones en vivo ahora, con si el usuario las descartó de Inicio. La app lo consulta al abrir
// y cada 60 s. Auth: JWT de Supabase por Bearer.
export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    const live = await loadLive(auth.admin, auth.profileId)
    return NextResponse.json({ live }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('GET /api/live falló:', err)
    return NextResponse.json({ live: [] })
  }
}
