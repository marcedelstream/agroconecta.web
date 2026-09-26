import type { createSupabaseAdmin } from '@/lib/supabase-admin'

// Planes de Karai (2026-09-26): todo usuario con cuenta tiene un plan gratis de 5 consultas por día;
// los miembros (profiles.is_member) mantienen 15. Pro (149.000 Gs/mes) y Organizaciones
// (349.000 Gs/mes) se definen con el área comercial — ahí cambian estos límites.
export const FREE_DAILY_LIMIT = 5
export const MEMBER_DAILY_LIMIT = 15
/** @deprecated usar dailyLimitFor(); se mantiene por compatibilidad. */
export const DAILY_TEXT_LIMIT = MEMBER_DAILY_LIMIT

export function dailyLimitFor(isMember: boolean): number {
  return isMember ? MEMBER_DAILY_LIMIT : FREE_DAILY_LIMIT
}

export async function isActiveMember(admin: ReturnType<typeof createSupabaseAdmin>, profileId: string): Promise<boolean> {
  const { data } = await admin.from('profiles').select('is_member').eq('id', profileId).maybeSingle()
  return data?.is_member === true
}

const ASUNCION_OFFSET_HOURS = 3 // UTC-3, Paraguay no usa horario de verano desde 2024.

export function startOfTodayAsuncionUtc(): string {
  const now = new Date()
  const shifted = new Date(now.getTime() - ASUNCION_OFFSET_HOURS * 3_600_000)
  shifted.setUTCHours(0, 0, 0, 0)
  return new Date(shifted.getTime() + ASUNCION_OFFSET_HOURS * 3_600_000).toISOString()
}

export async function getUsageToday(
  admin: ReturnType<typeof createSupabaseAdmin>,
  profileId: string,
): Promise<number> {
  const { count, error } = await admin
    .from('usage_ledger')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', startOfTodayAsuncionUtc())

  if (error) throw error
  return count ?? 0
}

export function quotaReachedReply(isMember: boolean): string {
  return isMember
    ? `Llegaste al límite de ${MEMBER_DAILY_LIMIT} consultas de hoy. Mañana se reinicia — si necesitás más consultas por día para vos o tu organización, escribinos por WhatsApp.`
    : `Usaste tus ${FREE_DAILY_LIMIT} consultas gratis de hoy. Mañana se reinician — si necesitás más, pronto vas a poder pasarte a Agroconecta Pro.`
}

/** @deprecated usar quotaReachedReply(). */
export const QUOTA_REACHED_REPLY = quotaReachedReply(true)
