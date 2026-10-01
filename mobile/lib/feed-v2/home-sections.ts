import type { Ionicons } from '@expo/vector-icons'

// Bloques del Inicio v2 y su orden ("Ordenar intereses", como el "Ajustar interés" de la v1). El orden se
// guarda en profiles.section_order (mismo campo que la v1; las claves viejas se descartan solas).

export type HomeBlockKey = 'market' | 'live' | 'news' | 'agenda' | 'learn' | 'library' | 'categories' | 'trending' | 'services'

export const HOME_BLOCKS: { key: HomeBlockKey; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'market', label: 'Tu mercado hoy', icon: 'trending-up-outline' },
  { key: 'live', label: 'En vivo', icon: 'radio-outline' },
  { key: 'news', label: 'Noticias para vos', icon: 'newspaper-outline' },
  { key: 'agenda', label: 'Eventos Agro', icon: 'calendar-outline' },
  { key: 'learn', label: 'Cursos y oportunidades', icon: 'school-outline' },
  { key: 'library', label: 'Biblioteca', icon: 'library-outline' },
  { key: 'categories', label: 'Categorías', icon: 'grid-outline' },
  { key: 'trending', label: 'Tendencias', icon: 'flame-outline' },
  { key: 'services', label: 'Servicios de Agroconecta', icon: 'briefcase-outline' },
]

const DEFAULT_ORDER = HOME_BLOCKS.map((b) => b.key)

export function normalizeHomeOrder(order: string[] | undefined): HomeBlockKey[] {
  const valid = (order ?? []).filter((k): k is HomeBlockKey => DEFAULT_ORDER.includes(k as HomeBlockKey))
  return [...new Set(valid), ...DEFAULT_ORDER.filter((k) => !valid.includes(k))]
}
