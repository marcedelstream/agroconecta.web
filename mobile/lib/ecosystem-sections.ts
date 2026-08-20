import type { Ionicons } from '@expo/vector-icons'

export type EcosystemSectionKey = 'videos' | 'empleos' | 'clasificados' | 'cursos' | 'biblioteca'

interface EcosystemSectionMeta {
  key: EcosystemSectionKey
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
}

// Orden por default — mismo criterio que home-sections.ts.
export const DEFAULT_ECOSYSTEM_SECTION_ORDER: EcosystemSectionKey[] = [
  'videos', 'empleos', 'clasificados', 'cursos', 'biblioteca',
]

export const ECOSYSTEM_SECTIONS: EcosystemSectionMeta[] = [
  { key: 'videos', label: 'Videos', icon: 'videocam-outline' },
  { key: 'empleos', label: 'Empleos', icon: 'briefcase-outline' },
  { key: 'clasificados', label: 'Clasificados', icon: 'pricetags-outline' },
  { key: 'cursos', label: 'Cursos', icon: 'school-outline' },
  { key: 'biblioteca', label: 'Biblioteca del agro', icon: 'book-outline' },
]

// Normaliza un ecosystemSectionOrder guardado: saca claves que ya no existen y agrega al
// final las que falten (secciones nuevas que el usuario nunca reordenó).
export function normalizeEcosystemSectionOrder(order: string[] | undefined): EcosystemSectionKey[] {
  const valid = (order ?? []).filter((key): key is EcosystemSectionKey =>
    DEFAULT_ECOSYSTEM_SECTION_ORDER.includes(key as EcosystemSectionKey)
  )
  const missing = DEFAULT_ECOSYSTEM_SECTION_ORDER.filter((key) => !valid.includes(key))
  return [...valid, ...missing]
}
