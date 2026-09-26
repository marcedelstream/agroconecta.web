import Link from 'next/link'
import { ChevronDown, TriangleAlert } from 'lucide-react'
import { PageHeader } from '@/components/admin/ui'

interface Recipe {
  title: string
  href: string
  steps: string[]
}

// Recetas cortas para las tareas de todos los días. Si se agrega una pantalla nueva al panel, sumar
// acá su receta.
const RECIPES: Recipe[] = [
  {
    title: 'Aprobar una publicación',
    href: '/admin/publicaciones?status=pending_review',
    steps: ['Entrá a Publicaciones y filtrá "En revisión".', 'Abrí la nota y leela completa.', 'Si está bien, tocá "Aprobar". Si no, "Rechazar" y escribí el motivo.'],
  },
  {
    title: 'Cargar una nota nueva',
    href: '/admin/publicaciones/nueva',
    steps: ['Tocá "Nueva publicación".', 'Completá título, bajada, texto, categoría y organización.', 'Subí una foto horizontal buena (se ve grande en la app).', 'Guardá. Si la marcás como importante, se manda un aviso a la app.'],
  },
  {
    title: 'Crear una encuesta o un quiz',
    href: '/admin/encuestas',
    steps: ['Entrá a Encuestas y quiz.', 'Encuesta: escribí la pregunta y una opción por línea (de 2 a 5).', 'Quiz: 3 preguntas, cada una con sus opciones y el número de la correcta.', 'Aparecen en el feed de la app y dan puntos al responder.'],
  },
  {
    title: 'Prender un remate o evento en vivo',
    href: '/admin/en-vivo',
    steps: ['Entrá a En vivo y cargá la transmisión con el link de YouTube.', 'Cuando empiece, tocá "Prender": aparece arriba del feed.', 'Podés actualizar el dato en vivo (ej. "Lote 12/40").', 'Al terminar, tocá "Apagar". Si no, sigue apareciendo.'],
  },
  {
    title: 'Cargar publicidad para la app',
    href: '/admin/banners',
    steps: ['Entrá a Publicidad → Banners.', 'Subí la imagen y marcá "App v2 · Feed" o "Dentro de la noticia".', 'Completá anunciante, bajada y texto del botón (máx. 18 letras).', 'Elegí el destino (evento, nota o link). El resultado se ve en la pestaña Reporte.'],
  },
  {
    title: 'Validar un código de canje',
    href: '/admin/premios',
    steps: ['Cuando el aliado te pase un código AGRO-XXXX, entrá a Premios y canjes.', 'Escribilo en "Validar código" y tocá "Marcar como usado".', 'Si dice que no existe o ya se usó, no lo aceptes.'],
  },
  {
    title: 'Responder una consulta',
    href: '/admin/consultas',
    steps: ['Entrá a Consultas: arriba están las pendientes.', 'Escribile a la persona por WhatsApp o email.', 'Cuando la atiendas, marcala como "Atendida".'],
  },
  {
    title: 'Mandar una notificación',
    href: '/admin/notificaciones',
    steps: ['Entrá a Notificaciones.', 'Escribí un título corto y el mensaje.', 'Elegí la categoría: solo la reciben quienes la tienen activada.', 'Revisá bien antes de mandar: no se puede deshacer.'],
  },
]

const CAREFUL = [
  'Borrar es para siempre: no hay papelera.',
  'Una notificación llega a todos los teléfonos al instante.',
  'Un código de canje marcado como usado no se puede volver atrás.',
  'Si algo no funciona o no estás seguro, preguntá antes de tocar.',
]

export default function GuiaPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Guía del panel" help="Pasos cortos para las tareas de todos los días. Tocá una para ver cómo se hace." />

      <div className="space-y-3">
        {RECIPES.map((r) => (
          <details key={r.title} className="card group p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display font-semibold text-foreground">
              {r.title}
              <ChevronDown size={18} className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="px-5 pb-5">
              <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-foreground">
                {r.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <Link href={r.href} className="btn-primary text-sm mt-4">Ir a la pantalla</Link>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-warning/40 bg-warning/10 p-5">
        <p className="flex items-center gap-2 font-display font-semibold text-foreground mb-2">
          <TriangleAlert size={18} className="text-warning" aria-hidden /> Con cuidado
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
          {CAREFUL.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
    </div>
  )
}
