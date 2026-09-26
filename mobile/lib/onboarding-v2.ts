import { supabase } from './supabase'
import type { NewsCategory } from './types'

// Onboarding v2 (docs/design_handoff_v2_feed/ONBOARDING-V2.md): lo mínimo para que el primer feed ya
// sea relevante. Rubros, producción, objetivos y escala van a `user_profile_facets` (los lee el
// ranking del feed); el resto usa el mismo guardado de perfil de la v1 (completeOnboarding).

export interface Option {
  value: string
  label: string
}

export const RUBRO_OPTIONS: Option[] = [
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'ganaderia', label: 'Ganadería' },
  { value: 'horticultura', label: 'Horticultura' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'mercados', label: 'Mercados' },
]

// Qué producís o te interesa, según los rubros elegidos.
export const PRODUCTION_BY_RUBRO: Record<string, Option[]> = {
  agricultura: ['soja', 'maíz', 'trigo', 'arroz', 'sésamo', 'chía', 'girasol'].map((l) => ({ value: slug(l), label: cap(l) })),
  ganaderia: ['cría', 'invernada', 'feedlot', 'tambo', 'porcino', 'avícola'].map((l) => ({ value: slug(l), label: cap(l) })),
  horticultura: ['hortalizas', 'frutas', 'invernadero'].map((l) => ({ value: slug(l), label: cap(l) })),
  tecnologia: ['drones', 'agricultura de precisión', 'riego'].map((l) => ({ value: slug(l), label: cap(l) })),
  mercados: ['granos', 'hacienda', 'insumos'].map((l) => ({ value: slug(l), label: cap(l) })),
}

export const SCALE_OPTIONS: Option[] = [
  { value: 'productor-chico', label: 'Productor chico' },
  { value: 'productor-mediano', label: 'Productor mediano' },
  { value: 'productor-grande', label: 'Productor grande' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'estudiante', label: 'Estudiante' },
]

export const GOAL_OPTIONS: Option[] = [
  { value: 'informarme', label: 'Informarme' },
  { value: 'precios', label: 'Ver precios' },
  { value: 'capacitarme', label: 'Capacitarme' },
  { value: 'comprar-vender', label: 'Comprar y vender' },
  { value: 'empleo', label: 'Buscar empleo' },
  { value: 'eventos-remates', label: 'Eventos y remates' },
]

function slug(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Los rubros también se guardan como categorías de noticias de la v1 (user_interests), para que la
// segmentación de anuncios y la v1 sigan funcionando igual.
const RUBRO_TO_CATEGORY: Record<string, NewsCategory> = {
  agricultura: 'agricultura',
  ganaderia: 'ganaderia',
  horticultura: 'agricultura',
  tecnologia: 'tecnologia',
  mercados: 'mercados',
}

export function rubrosToCategories(rubros: string[]): NewsCategory[] {
  return [...new Set(rubros.map((r) => RUBRO_TO_CATEGORY[r]).filter((c): c is NewsCategory => !!c))]
}

export interface OnboardingExtras {
  rubros: string[]
  production: string[]
  goals: string[]
  scale: string | null
}

/** Facetas + consentimientos. Best-effort como el resto del sync de perfil: si falla, no traba la entrada. */
export async function saveOnboardingExtras(userId: string, extras: OnboardingExtras): Promise<void> {
  const facets = [
    ...extras.rubros.map((value) => ({ user_id: userId, facet: 'rubro', value })),
    ...extras.production.map((value) => ({ user_id: userId, facet: 'produccion', value })),
    ...extras.goals.map((value) => ({ user_id: userId, facet: 'objetivo', value })),
    ...(extras.scale ? [{ user_id: userId, facet: 'escala', value: extras.scale }] : []),
  ]
  await supabase.from('user_profile_facets').delete().eq('user_id', userId)
  if (facets.length > 0) await supabase.from('user_profile_facets').insert(facets)
  await supabase.from('consents').insert([
    { profile_id: userId, consent_type: 'terms', metadata: { source: 'onboarding_v2' } },
    { profile_id: userId, consent_type: 'points_program', metadata: { source: 'onboarding_v2' } },
  ])
}
