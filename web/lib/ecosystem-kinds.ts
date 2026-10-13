import type { EcosystemListingKind } from '@/lib/types'

// Lo que cambia según el tipo de aviso: cómo se llama cada campo, ejemplos y sugerencias. La tabla
// `ecosystem_listings` es la misma para los tres, así que esto es solo cómo se le pregunta a quien carga.
export interface EcosystemKindConfig {
  label: string
  /** Una línea para la tarjeta de "¿Qué encontraste?". */
  pitch: string
  emoji: string
  title: { label: string; placeholder: string }
  publisher: { label: string; placeholder: string; help: string }
  modality: { label: string; help: string; suggestions: string[] }
  location: { placeholder: string }
  description: { placeholder: string; checklist: string[] }
  categories: string[]
  contactHelp: string
}

export const ECOSYSTEM_KINDS: Record<EcosystemListingKind, EcosystemKindConfig> = {
  empleo: {
    label: 'Empleo',
    pitch: 'Una vacante de trabajo: estancia, empresa, cooperativa…',
    emoji: '💼',
    title: { label: 'Puesto', placeholder: 'Ej: Capataz de estancia ganadera' },
    publisher: { label: 'Empresa o empleador', placeholder: 'Ej: Estancia La Esperanza', help: 'Quién busca a la persona.' },
    modality: { label: 'Jornada', help: 'Cómo es el trabajo. Se ve en la tarjeta del aviso.', suggestions: ['Tiempo completo', 'Media jornada', 'Presencial', 'Remoto', 'Por temporada', 'Con vivienda'] },
    location: { placeholder: 'Ej: San Pedro' },
    description: {
      placeholder: 'Qué tareas tiene, qué requisitos piden y qué ofrecen.',
      checklist: ['Tareas del puesto', 'Requisitos (experiencia, carnet, estudios)', 'Qué ofrecen (sueldo, vivienda, beneficios)', 'Hasta cuándo reciben postulaciones'],
    },
    categories: ['Ganadería', 'Agricultura', 'Maquinaria', 'Veterinaria', 'Administración', 'Ventas', 'Tecnología'],
    contactHelp: 'A dónde se postula la gente: WhatsApp (595…), mail o el link del aviso original.',
  },
  curso: {
    label: 'Curso',
    pitch: 'Una capacitación, taller, diplomado o charla.',
    emoji: '🎓',
    title: { label: 'Nombre del curso', placeholder: 'Ej: Manejo de pasturas en el Chaco' },
    publisher: { label: 'Institución que lo dicta', placeholder: 'Ej: Facultad de Ciencias Agrarias – UNA', help: 'Quién organiza o dicta el curso.' },
    modality: { label: 'Modalidad', help: 'Online, presencial o mixto. Se ve en la tarjeta del aviso.', suggestions: ['Online', 'Presencial', 'Mixto', 'Gratuito', 'Con certificado'] },
    location: { placeholder: 'Ej: Asunción (u "Online")' },
    description: {
      placeholder: 'De qué trata, para quién es, fechas, duración y costo.',
      checklist: ['Temario o de qué trata', 'Para quién es', 'Fecha de inicio y duración', 'Costo (o si es gratis)', 'Si da certificado'],
    },
    categories: ['Ganadería', 'Agricultura', 'Veterinaria', 'Gestión', 'Tecnología', 'Maquinaria'],
    contactHelp: 'Dónde se inscribe la gente: link de inscripción o WhatsApp (595…).',
  },
  clasificado: {
    label: 'Clasificado',
    pitch: 'Algo a la venta: hacienda, maquinaria, campo, insumos.',
    emoji: '🏷️',
    title: { label: 'Qué se vende', placeholder: 'Ej: Tractor John Deere 6110J año 2018' },
    publisher: { label: 'Vendedor', placeholder: 'Nombre de la persona o empresa', help: 'Quién vende.' },
    modality: { label: 'Estado', help: 'Nuevo, usado, lote… Se ve en la tarjeta del aviso.', suggestions: ['Usado', 'Nuevo', 'Lote completo', 'Financiado', 'Permuta'] },
    location: { placeholder: 'Ej: Caaguazú' },
    description: {
      placeholder: 'Precio, estado, cantidad y cualquier detalle útil para el comprador.',
      checklist: ['Precio (₲ o US$) o "a convenir"', 'Estado y año / edad', 'Cantidad o superficie', 'Si acepta financiación o permuta'],
    },
    categories: ['Hacienda', 'Maquinaria', 'Campos', 'Insumos', 'Equipos', 'Vehículos'],
    contactHelp: 'WhatsApp del vendedor con código de país (595…) o el link del aviso original.',
  },
}

export const ECOSYSTEM_KIND_ORDER: EcosystemListingKind[] = ['empleo', 'curso', 'clasificado']

export function isEcosystemKind(value: unknown): value is EcosystemListingKind {
  return typeof value === 'string' && value in ECOSYSTEM_KINDS
}
