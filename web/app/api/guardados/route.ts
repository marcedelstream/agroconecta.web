import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { buildGuardados } from '@/lib/feed/guardados'

export const dynamic = 'force-dynamic'

// Pestaña Guardados de la app v2: guardados, recordatorios y actividad del usuario del JWT.
export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const page = await buildGuardados(auth.admin, auth.profileId)
    return NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('GET /api/guardados falló:', err)
    return NextResponse.json({ error: 'No pudimos cargar tus guardados.' }, { status: 500 })
  }
}
