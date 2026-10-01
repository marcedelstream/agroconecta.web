import type { SupabaseClient } from '@supabase/supabase-js'
import { CATEGORY_LABELS } from '@/lib/types'

// Opciones de intereses que maneja el panel (/admin/intereses, supabase/fix-v2-interests.sql).

export type InterestKind = 'rubro' | 'produccion' | 'objetivo' | 'escala'

export const INTEREST_KINDS: { value: InterestKind; label: string; help: string }[] = [
  { value: 'rubro', label: 'Rubros', help: 'Los grandes temas (Ganadería, Agricultura…). Se eligen en el onboarding y filtran el Inicio de la app.' },
  { value: 'produccion', label: 'Qué producen', help: 'Lo que produce o le interesa a cada persona dentro de un rubro (soja, cría, tambo…). El feed lo usa para recomendar.' },
  { value: 'objetivo', label: 'Para qué usan la app', help: 'Lo que la persona quiere hacer en la app (informarse, ver precios, capacitarse…).' },
  { value: 'escala', label: 'Escala', help: 'Qué tipo de usuario es (productor chico, técnico, empresa…).' },
]

export interface InterestOption {
  id: string
  kind: InterestKind
  value: string
  label: string
  parent: string | null
  position: number
  is_active: boolean
}

export async function loadInterestOptions(db: SupabaseClient, onlyActive = false): Promise<InterestOption[]> {
  let query = db.from('interest_options').select('id,kind,value,label,parent,position,is_active').order('position').order('label')
  if (onlyActive) query = query.eq('is_active', true)
  const { data, error } = await query
  return error ? [] : ((data ?? []) as InterestOption[])
}

/**
 * Rubros nuevos del panel que todavía no son categoría de noticias: se suman al selector de categoría de
 * las publicaciones, así se puede cargar contenido para ese rubro y el feed tiene qué recomendar.
 */
export async function extraPostCategories(db: SupabaseClient): Promise<{ value: string; label: string }[]> {
  const rubros = (await loadInterestOptions(db, true)).filter((o) => o.kind === 'rubro')
  return rubros.filter((r) => !(r.value in CATEGORY_LABELS)).map((r) => ({ value: r.value, label: r.label }))
}
