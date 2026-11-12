import type { createSupabaseAdmin } from '@/lib/supabase-admin'

type Admin = ReturnType<typeof createSupabaseAdmin>

// Consentimientos de Karai, guardados en la tabla `consents` (fix-karai-foundations.sql):
// - karai_ai: sus mensajes se envían al proveedor de IA para generar la respuesta.
// - karai_campo: Karai usa y guarda los datos de su finca (Mi campo).
// Se registran la primera vez que el usuario usa cada función (con aviso en el chat y la política)
// y se pueden revocar desde /karai/mis-datos → Privacidad. Una revocación no borra datos: borrar
// sigue siendo una acción aparte del usuario (conversaciones, filas de Mi campo, cuenta).
export const CONSENT_AI = 'karai_ai'
export const CONSENT_FARM = 'karai_campo'
export type KaraiConsentType = typeof CONSENT_AI | typeof CONSENT_FARM

/** Versión de la política vigente cuando se otorgó el consentimiento. Subirla al cambiar /politica. */
export const CONSENT_POLICY_VERSION = '2026-11-12'

export type ConsentState = 'granted' | 'revoked' | 'none'

export const AI_REVOKED_REPLY =
  'Desactivaste el uso de inteligencia artificial en Karai, por eso no puedo responderte. Podés volver a activarlo en Mis datos → Privacidad.'

export const FARM_REVOKED_NOTE =
  'El usuario desactivó "Mi campo": no uses ni guardes datos de su finca. Si te cuenta datos de su finca, usalos solo para esta respuesta y avisale que no se guardan.'

export async function getConsentState(admin: Admin, profileId: string, type: KaraiConsentType): Promise<ConsentState> {
  const { data, error } = await admin.from('consents').select('status').eq('profile_id', profileId).eq('consent_type', type)
  if (error) throw error
  const rows = (data ?? []) as { status: string }[]
  if (rows.some((r) => r.status === 'granted')) return 'granted'
  if (rows.some((r) => r.status === 'revoked')) return 'revoked'
  return 'none'
}

async function insertGranted(admin: Admin, profileId: string, type: KaraiConsentType, source: string) {
  const { error } = await admin.from('consents').insert({
    profile_id: profileId,
    consent_type: type,
    status: 'granted',
    metadata: { source, policy_version: CONSENT_POLICY_VERSION },
  })
  // 23505: otra solicitud en paralelo ya lo registró (índice único parcial) — es lo mismo que éxito.
  if (error && error.code !== '23505') throw error
}

/** Registra el consentimiento la primera vez que se usa la función. Si estaba revocado, no lo reactiva. */
export async function recordFirstUse(admin: Admin, profileId: string, type: KaraiConsentType): Promise<ConsentState> {
  const state = await getConsentState(admin, profileId, type)
  if (state !== 'none') return state
  await insertGranted(admin, profileId, type, 'first_use')
  return 'granted'
}

/** Activar/desactivar desde Mis datos. Revocar marca los otorgamientos vigentes; activar inserta uno nuevo. */
export async function setConsent(admin: Admin, profileId: string, type: KaraiConsentType, granted: boolean): Promise<void> {
  if (granted) {
    const state = await getConsentState(admin, profileId, type)
    if (state !== 'granted') await insertGranted(admin, profileId, type, 'user_setting')
    return
  }

  const { error } = await admin
    .from('consents')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('profile_id', profileId)
    .eq('consent_type', type)
    .eq('status', 'granted')
  if (error) throw error
}

/**
 * ¿Puede Karai usar Mi campo para este usuario? Revocado → no. Sin registro y con datos de finca ya
 * cargados antes de que existiera el registro → se usa y queda registrado ahora (primer uso).
 */
export async function resolveFarmConsent(admin: Admin, profileId: string): Promise<boolean> {
  const state = await getConsentState(admin, profileId, CONSENT_FARM)
  if (state === 'revoked') return false
  if (state === 'none') {
    const { data } = await admin.from('farm_profile').select('profile_id').eq('profile_id', profileId).maybeSingle()
    if (data) await recordFirstUse(admin, profileId, CONSENT_FARM)
  }
  return true
}
