import { createSupabaseServer } from './supabase-server'

export type UserRole = 'admin'

export interface AuthContext {
  userId: string
  email: string | undefined
  role: UserRole
  organizationId: string | null
}

export function isAgroAdminRole(role: unknown) {
  return role === 'admin' || role === 'agro_admin'
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAgroAdminRole(user.app_metadata?.role)) return null

  return {
    userId: user.id,
    email: user.email,
    role: 'admin',
    organizationId: null,
  }
}
