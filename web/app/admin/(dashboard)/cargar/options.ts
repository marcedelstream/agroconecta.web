import { ECOSYSTEM_KINDS, ECOSYSTEM_KIND_ORDER } from '@/lib/ecosystem-kinds'

export interface LoadOption {
  id: string
  emoji: string
  label: string
  pitch: string
  note?: string
  checklist: string[]
  /** La primera es la acción principal. */
  actions: { label: string; href: string }[]
}

const ecosystemOptions: LoadOption[] = ECOSYSTEM_KIND_ORDER.map((kind) => {
  const cfg = ECOSYSTEM_KINDS[kind]
  return {
    id: kind,
    emoji: cfg.emoji,
    label: cfg.label,
    pitch: cfg.pitch,
    note: 'Si lo viste en una página, pegá el link en el formulario y se completan los datos solos.',
    checklist: [`${cfg.title.label} y ${cfg.publisher.label.toLowerCase()}`, ...cfg.description.checklist, 'Un contacto (WhatsApp, mail o link)'],
    actions: [{ label: `Cargar ${cfg.label.toLowerCase()}`, href: `/admin/ecosistema?nuevo=${kind}` }],
  }
})

// Todo lo que se puede cargar en el panel, ordenado por lo que más se encuentra navegando.
export const LOAD_OPTIONS: LoadOption[] = [
  {
    id: 'noticia',
    emoji: '📰',
    label: 'Noticia',
    pitch: 'Una nota de otro medio o algo para contar.',
    note: 'Si es de otro medio, pegá el link: se arma la nota reescrita (o copiada con la fuente) para revisar.',
    checklist: ['El link de la nota, o el texto', 'Una foto (si la nota original no tiene)', 'A qué rubro pertenece'],
    actions: [
      { label: 'Tengo el link', href: '/admin/publicaciones/importar' },
      { label: 'La escribo yo', href: '/admin/publicaciones/nueva' },
    ],
  },
  ...ecosystemOptions,
  {
    id: 'video',
    emoji: '🎥',
    label: 'Video o remate',
    pitch: 'Un video de YouTube o la transmisión de un remate.',
    checklist: ['El link de YouTube', 'Título y una descripción corta', 'Para remates: si está en vivo o ya terminó'],
    actions: [
      { label: 'Cargar video', href: '/admin/publicaciones/nueva?tipo=video' },
      { label: 'Cargar remate', href: '/admin/publicaciones/nueva?tipo=auction' },
    ],
  },
  {
    id: 'libro',
    emoji: '📚',
    label: 'Libro o guía',
    pitch: 'Un PDF, manual o guía técnica para leer en la app.',
    checklist: ['El PDF o su link', 'Título y autor', 'Una tapa (imagen)'],
    actions: [{ label: 'Cargar libro', href: '/admin/biblioteca?nuevo=1' }],
  },
  {
    id: 'evento',
    emoji: '📅',
    label: 'Evento',
    pitch: 'Una expo, feria, jornada o charla.',
    note: 'El evento en sí (fecha, lugar) se crea en eventosagropy.com. Acá le sumás el programa, el banner y las noticias.',
    checklist: ['El slug del evento en eventosagropy.com', 'El programa (horarios y actividades)', 'Un banner'],
    actions: [{ label: 'Ir a Eventos', href: '/admin/eventos' }],
  },
  {
    id: 'precio',
    emoji: '📈',
    label: 'Precios',
    pitch: 'Cotizaciones de hacienda o granos del día.',
    checklist: ['La fuente (feria, bolsa, frigorífico)', 'Los valores y la fecha'],
    actions: [{ label: 'Ir a Precios', href: '/admin/precios' }],
  },
]
