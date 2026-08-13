import type { Ionicons } from '@expo/vector-icons'
import type { EcosystemListingKind } from './types'

export interface EcosystemPlatform {
  id: string
  name: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  description: string
  /** Si tiene un listado propio (empleo/clasificado/curso), qué kind de EcosystemListing muestra. */
  listingKind?: EcosystemListingKind
  /** Ruta directa a otra pantalla en vez de un listado — usado por Remates, que ya vive en Videos. */
  route?: string
}

// Quedan 100% dentro de la app, sin links externos. Clasificados/Bolsa de Trabajo/Cursos
// muestran EcosystemListing reales (ver lib/supabase-repositories.ts); Remates ya tiene
// contenido propio vía posts (contentType 'auction') y apunta directo a Videos.
export const ECOSYSTEM_PLATFORMS: EcosystemPlatform[] = [
  {
    id: 'clasificados',
    name: 'Clasificados',
    icon: 'pricetags-outline',
    description: 'Publicá o encontrá maquinaria, hacienda e insumos del agro paraguayo.',
    listingKind: 'clasificado',
  },
  {
    id: 'bolsa-trabajo',
    name: 'Bolsa de Trabajo',
    icon: 'briefcase-outline',
    description: 'Conectate con oportunidades laborales del sector agropecuario paraguayo — el LinkedIn del agro.',
    listingKind: 'empleo',
  },
  {
    id: 'remates-online',
    name: 'Galería de videos',
    icon: 'videocam-outline',
    description: 'Mirá programas, entrevistas y remates de ganado transmitidos en vivo, sin salir de la app.',
    route: '/(main)/videos',
  },
  {
    id: 'cursos',
    name: 'Cursos',
    icon: 'school-outline',
    description: 'Capacitaciones y cursos online para productores y profesionales del agro paraguayo.',
    listingKind: 'curso',
  },
]
