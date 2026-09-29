import { supabase } from './supabase'

// "Mi campo" de Karai Campo: la misma fila que edita la web en /karai/mis-datos (farm_profile, jsonb,
// RLS de dueño — ver supabase/fix-karai-farm-and-knowledge.sql). Mismos nombres de campo que
// web/lib/karai/farm-extraction.ts: Karai los lee de ahí para responder, y también los completa solo
// cuando el usuario los menciona en el chat.

export interface FarmAnimal {
  tipo: string
  cantidad: number
}

export interface FarmCrop {
  tipo: string
  hectareas: number
}

export interface FarmData {
  nombre?: string
  distrito?: string
  hectareas?: number
  animales?: FarmAnimal[]
  cultivos?: FarmCrop[]
  notas?: string
  // El resto de los campos (lotes, intereses…) se conservan tal cual al guardar.
  [key: string]: unknown
}

export async function fetchFarmData(userId: string): Promise<FarmData> {
  const { data, error } = await supabase.from('farm_profile').select('data').eq('profile_id', userId).maybeSingle()
  if (error) throw error
  return ((data as { data: FarmData } | null)?.data ?? {}) as FarmData
}

export async function saveFarmData(userId: string, data: FarmData): Promise<boolean> {
  const { error } = await supabase
    .from('farm_profile')
    .upsert({ profile_id: userId, data, updated_at: new Date().toISOString() })
  return !error
}

/** true si todavía no cargó nada productivo (para invitarlo a completar Mi campo). */
export function isFarmEmpty(d: FarmData): boolean {
  return !d.hectareas && !(d.animales?.length) && !(d.cultivos?.length)
}
