import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const admin = createSupabaseAdmin()

  const { data, error: userError } = await admin.auth.getUser(token)
  if (userError || !data.user) {
    return NextResponse.json({ error: 'Sesión inválida o expirada.' }, { status: 401 })
  }

  const { error } = await admin.auth.admin.deleteUser(data.user.id)
  if (error) {
    console.error('delete-account error:', error)
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
