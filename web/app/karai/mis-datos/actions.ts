'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'
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

  revalidatePath('/karai/mis-datos')
  return { error: null }
}
