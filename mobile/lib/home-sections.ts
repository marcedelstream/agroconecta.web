import type { Ionicons } from '@expo/vector-icons'

export type HomeSectionKey = 'market' | 'services' | 'live' | 'news' | 'agenda'

interface HomeSectionMeta {
  key: HomeSectionKey
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
}

// Orden por default (boceto 3a) — se usa si el usuario todavía no personalizó nada,
// y como base para completar si se agrega una banda nueva más adelante.
export const DEFAULT_SECTION_ORDER: HomeSectionKey[] = ['market', 'services', 'live', 'news', 'agenda']

export const HOME_SECTIONS: HomeSectionMeta[] = [
  { key: 'market', label: 'Tu mercado hoy', icon: 'trending-up-outline' },
  { key: 'services', label: 'Remates, empleos y más', icon: 'grid-outline' },
  { key: 'live', label: 'En vivo', icon: 'radio-outline' },
  { key: 'news', label: 'Noticias para vos', icon: 'newspaper-outline' },
  { key: 'agenda', label: 'Agenda del sector', icon: 'calendar-outline' },
]

// Normaliza un sectionOrder guardado: saca claves que ya no existen y agrega al final
// las que falten (bandas nuevas que el usuario nunca reordenó).
export function normalizeSectionOrder(order: string[] | undefined): HomeSectionKey[] {
  const valid = (order ?? []).filter((key): key is HomeSectionKey =>
    DEFAULT_SECTION_ORDER.includes(key as HomeSectionKey)
  )
  const missing = DEFAULT_SECTION_ORDER.filter((key) => !valid.includes(key))
  return [...valid, ...missing]
}
