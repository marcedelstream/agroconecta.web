import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  let token = authHeader?.replace(/^Bearer\s+/i, '')

  // Fallback al body si el header no llegó — un redirect de dominio (ej. apex → www)
  // puede pisar el header Authorization en el camino, pero el body de un POST sobrevive.
  if (!token) {
    const body = await request.json().catch(() => null)
    token = body?.token
  }

  if (!token) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  // createSupabaseAdmin() tira si falta SUPABASE_SERVICE_ROLE_KEY en el entorno — sin este
  // try/catch, esa excepción no controlada le devolvía al cliente una página de error
  // genérica de Next en vez de JSON, y el fetch del cliente no sabía interpretarla.
  let admin: ReturnType<typeof createSupabaseAdmin>
  try {
    admin = createSupabaseAdmin()
  } catch (err) {
    console.error('delete-account: createSupabaseAdmin falló:', err)
    return NextResponse.json(
      { error: 'El servidor no está configurado para eliminar cuentas (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 500 },
    )
  }

  const { data, error: userError } = await admin.auth.getUser(token)
  if (userError || !data.user) {
    return NextResponse.json({ error: 'Sesión inválida o expirada.' }, { status: 401 })
  }

  const { error } = await admin.auth.admin.deleteUser(data.user.id)
  if (error) {
    console.error('delete-account error:', error)
    return NextResponse.json({ error: `No se pudo eliminar la cuenta: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
