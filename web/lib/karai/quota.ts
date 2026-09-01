import type { createSupabaseAdmin } from '@/lib/supabase-admin'

// Starter (KARAI-MODELO-NEGOCIO.md): 15 consultas de texto por dia. Teams/Enterprise quedan para
// cuando exista el vinculo numero<->organizacion — por ahora todos los perfiles caen en Starter.
export const DAILY_TEXT_LIMIT = 15

const ASUNCION_OFFSET_HOURS = 3 // UTC-3, Paraguay no usa horario de verano desde 2024.

function startOfTodayAsuncionUtc(): string {
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

export const QUOTA_REACHED_REPLY =
  'Llegaste al límite de 15 consultas gratuitas de hoy. Mañana se reinicia — si querés más consultas por día para vos o tu organización, escribinos por WhatsApp y te contamos sobre Karai Teams.'
