'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { ExtractedFarmData } from '@/lib/karai/farm-extraction'

export type FarmProfileActionState = { error: string | null; ok?: boolean }

// A propósito NO usa el cliente admin — corre con la sesión del usuario logueado, así RLS
// (auth.uid() = profile_id, ver fix-karai-farm-and-knowledge.sql) es la que realmente impide que
// alguien edite datos de otro perfil, no solo la lógica de la app.
export async function saveFarmProfile(_prev: FarmProfileActionState, formData: FormData): Promise<FarmProfileActionState> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesión inválida.' }

  const raw = formData.get('data')
  if (typeof raw !== 'string') return { error: 'Datos inválidos.' }

  let data: ExtractedFarmData
  try {
    data = JSON.parse(raw)
  } catch {
    return { error: 'Datos inválidos.' }
  }

  const { error } = await supabase
    .from('farm_profile')
    .upsert({ profile_id: user.id, data, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }

  revalidatePath('/karai/mis-datos')
  return { error: null, ok: true }
}
