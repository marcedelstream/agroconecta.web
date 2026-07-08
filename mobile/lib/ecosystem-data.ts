import type { Ionicons } from '@expo/vector-icons'

export interface UpcomingPlatform {
  id: string
  name: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  description: string
}

// Todas "próximamente" por ahora — quedan 100% dentro de la app, sin links externos.
export const UPCOMING_PLATFORMS: UpcomingPlatform[] = [
  {
    id: 'clasificados',
    name: 'Clasificados',
    icon: 'pricetags-outline',
    description: 'Publicá o encontrá servicios, productos e inmuebles del agro, organizados por secciones, igual que en Inicio.',
  },
  {
    id: 'bolsa-trabajo',
    name: 'Bolsa de Trabajo',
    icon: 'briefcase-outline',
    description: 'Conectate con oportunidades laborales del sector agropecuario paraguayo — el LinkedIn del agro.',
  },
  {
    id: 'remates-online',
    name: 'Remates Online',
    icon: 'megaphone-outline',
    description: 'Mirá y participá de remates de ganado transmitidos en vivo, sin salir de la app.',
  },
]
