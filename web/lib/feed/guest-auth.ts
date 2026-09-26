import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { authenticateKaraiRequest } from '@/lib/karai/auth'

type Admin = ReturnType<typeof createSupabaseAdmin>

/**
 * El feed y Explorar se ven sin iniciar sesión (Apple, Guideline 5.1.1(v): no exigir cuenta para ver
 * contenido). Sin header Authorization se responde como invitado (userId null, orden genérico); si
 * mandan un token y es inválido, 401 como en el resto de la API.
 */
export async function authenticateOptional(
  request: Request,
): Promise<{ admin: Admin; userId: string | null } | { error: string; status: number }> {
  if (!request.headers.get('authorization')) {
    try {
      return { admin: createSupabaseAdmin(), userId: null }
    } catch {
      return { error: 'El servidor no está configurado.', status: 500 }
    }
  }
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return auth
  return { admin: auth.admin, userId: auth.profileId }
}
