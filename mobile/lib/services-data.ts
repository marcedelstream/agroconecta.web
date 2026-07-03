import type { Ionicons } from '@expo/vector-icons'

export interface ServiceInfo {
  id: string
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  description: string
}

export const SERVICES: ServiceInfo[] = [
  {
    id: 'ambiental',
    label: 'Consultoría Ambiental',
    icon: 'leaf-outline',
    description: 'Asesoramiento técnico para productores y empresas del agro que necesitan cumplir con normativa ambiental, gestionar permisos o mejorar sus prácticas de sostenibilidad en campo.',
  },
  {
    id: 'marketing',
    label: 'Marketing Digital',
    icon: 'megaphone-outline',
    description: 'Estrategias de comunicación y presencia digital pensadas para organizaciones, medios y empresas del sector agropecuario paraguayo.',
  },
  {
    id: 'vegetal',
    label: 'Consultoría en Producción Vegetal',
    icon: 'flower-outline',
    description: 'Acompañamiento técnico en manejo de cultivos, suelos y planificación de zafra para mejorar el rendimiento de tu producción.',
  },
  {
    id: 'software',
    label: 'Desarrollo Web y Software',
    icon: 'code-slash-outline',
    description: 'Desarrollo de sitios web, apps y herramientas digitales a medida para organizaciones, cooperativas y empresas del agro.',
  },
  {
    id: 'publicidad',
    label: 'Publicidad en la App',
    icon: 'phone-portrait-outline',
    description: 'Espacios publicitarios segmentados por profesión, departamento y categoría dentro de la app de Agroconecta, para llegar directo a productores y profesionales del sector.',
  },
]
