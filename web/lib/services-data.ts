// Servicios de Agroconecta (mismo listado que mobile/lib/services-data.ts; el id es el service_type
// que llega a Consultas en el panel).
export interface ServiceInfo {
  id: string
  label: string
  description: string
}

export const SERVICES: ServiceInfo[] = [
  {
    id: 'ambiental',
    label: 'Consultoría Ambiental',
    description: 'Asesoramiento técnico para productores y empresas del agro que necesitan cumplir con normativa ambiental, gestionar permisos o mejorar sus prácticas de sostenibilidad en campo.',
  },
  {
    id: 'comunicacion',
    label: 'Consultoría en Comunicación',
    description: 'Estrategia de comunicación, prensa y contenidos para gremios, cooperativas, instituciones y empresas del agro: qué decir, a quién y por qué canal.',
  },
  {
    id: 'marketing',
    label: 'Marketing Digital',
    description: 'Estrategias de comunicación y presencia digital pensadas para organizaciones, medios y empresas del sector agropecuario paraguayo.',
  },
  {
    id: 'software',
    label: 'Desarrollo de Apps y Software',
    description: 'Desarrollo de sitios web, apps y herramientas digitales a medida para organizaciones, cooperativas y empresas del agro.',
  },
  {
    id: 'vegetal',
    label: 'Consultoría en Producción Vegetal',
    description: 'Acompañamiento técnico en manejo de cultivos, suelos y planificación de zafra para mejorar el rendimiento de tu producción.',
  },
  {
    id: 'publicidad',
    label: 'Publicidad en la App',
    description: 'Espacios publicitarios segmentados por profesión, departamento y categoría dentro de la app de Agroconecta, para llegar directo a productores y profesionales del sector.',
  },
]
