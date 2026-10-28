import type { SupabaseClient } from '@supabase/supabase-js'
import { CATEGORY_LABELS } from '@/lib/types'

// Opciones de intereses que maneja el panel (/admin/intereses, supabase/fix-v2-interests.sql).

export type InterestKind = 'rubro' | 'produccion' | 'objetivo' | 'escala'

export const INTEREST_KINDS: { value: InterestKind; label: string; help: string }[] = [
  { value: 'rubro', label: 'Categorías', help: 'Los grandes temas (Ganadería, Agricultura…). Se eligen en el onboarding, filtran el Inicio de la app y cada publicación lleva una.' },
  { value: 'produccion', label: 'Etiquetas', help: 'Temas puntuales dentro de cada categoría (soja, sésamo, cría, tambo…). La gente las elige en el onboarding y se le ponen a cada contenido: así el feed recomienda y avisa a quien sigue esa etiqueta.' },
  { value: 'objetivo', label: 'Para qué usan la app', help: 'Lo que la persona quiere hacer en la app (informarse, ver precios, capacitarse…).' },
  { value: 'escala', label: 'Escala (ya no se pregunta)', help: 'Desde el onboarding compacto ya no se pregunta: se reemplazó por la dimensión del campo en hectáreas. Queda para ver lo que eligió la gente antes.' },
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
