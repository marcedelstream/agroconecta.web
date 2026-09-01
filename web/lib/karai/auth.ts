import { createSupabaseAdmin } from '@/lib/supabase-admin'

// Mismo patron de auth que web/app/api/delete-account/route.ts: el cliente manda su JWT de sesion
// por Bearer, se valida con el service role (no confiamos en nada que mande el cliente aparte del
// token), y de ahi sale el profileId real — nunca un id que venga suelto en el body/query.
export async function authenticateKaraiRequest(
  request: Request,
): Promise<{ admin: ReturnType<typeof createSupabaseAdmin>; profileId: string } | { error: string; status: number }> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) return { error: 'No autorizado.', status: 401 }

  let admin: ReturnType<typeof createSupabaseAdmin>
  try {
    admin = createSupabaseAdmin()
  } catch (err) {
    console.error('authenticateKaraiRequest: createSupabaseAdmin falló:', err)
    return { error: 'El servidor no está configurado.', status: 500 }
  }

  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return { error: 'Sesión inválida o expirada.', status: 401 }

  return { admin, profileId: data.user.id }
}
