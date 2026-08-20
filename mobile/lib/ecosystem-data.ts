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
  /** Sitio externo — se abre embebido en app/(main)/webview.tsx, no sale de la app. */
  externalUrl?: string
}

// Clasificados/Empleos/Cursos muestran EcosystemListing reales (ver
// lib/supabase-repositories.ts); Remates ya tiene contenido propio vía posts (contentType
// 'auction') y apunta directo a Videos; Eventos Agro apunta a la pantalla de eventos ya
// existente; Agrojuego es el único externo (`externalUrl`, se abre embebido vía WebView).
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
    name: 'Empleos',
    icon: 'briefcase-outline',
    description: 'Conectate con oportunidades laborales del sector agropecuario paraguayo.',
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
  {
    id: 'eventos-agro',
    name: 'Eventos Agro',
    icon: 'calendar-outline',
    description: 'Agenda, cobertura y recordatorios de ferias, expos y remates del agro paraguayo.',
    route: '/(main)/events',
  },
  {
    id: 'agrojuego',
    name: 'Agrojuego',
    icon: 'game-controller-outline',
    description: 'Jugá, aprendé y ganá cupones de descuento en eventos y cursos del agro.',
    externalUrl: 'https://agrojuego.com',
  },
]
