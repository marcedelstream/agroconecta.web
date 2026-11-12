'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { CONSENT_AI, CONSENT_FARM, recordFirstUse, setConsent } from '@/lib/karai/consents'
import type { ExtractedFarmData } from '@/lib/karai/farm-extraction'

// A propósito NO usa el cliente admin — corre con la sesión del usuario logueado, así RLS
// (auth.uid() = profile_id, ver fix-karai-farm-and-knowledge.sql) es la que realmente impide que
// alguien edite datos de otro perfil, no solo la lógica de la app. Callable directo desde un client
// component (no necesita <form>/useActionState) porque MisDatosClient maneja un estado más rico
// -tablas con filas dinámicas- del que conviene manejar en React, no serializado en un <input hidden>.
export async function saveFarmProfile(data: ExtractedFarmData): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesión inválida.' }

  const { error } = await supabase
    .from('farm_profile')
    .upsert({ profile_id: user.id, data, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }

  // Guardar sus datos de finca es el primer uso de Mi campo: queda registrado el consentimiento.
  // Best-effort, igual que el resto de los registros de Karai: no debe tirar el guardado.
  try {
    await recordFirstUse(createSupabaseAdmin(), user.id, CONSENT_FARM)
  } catch (err) {
    console.error('saveFarmProfile: no se pudo registrar el consentimiento:', err)
  }

  revalidatePath('/karai/mis-datos')
  return { error: null }
}

// Activar/desactivar el uso de IA o de Mi campo. La identidad sale de la sesión (nunca de un
// parámetro) y la escritura va por el cliente admin porque `consents` no tiene policy de UPDATE.
export async function setKaraiConsent(kind: 'ai' | 'campo', granted: boolean): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesión inválida.' }

  try {
    await setConsent(createSupabaseAdmin(), user.id, kind === 'ai' ? CONSENT_AI : CONSENT_FARM, granted)
  } catch (err) {
    console.error('setKaraiConsent falló:', err)
    return { error: 'No se pudo guardar tu elección. Probá de nuevo.' }
  }

  revalidatePath('/karai/mis-datos')
  return { error: null }
}
