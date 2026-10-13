import { PageHeader } from '@/components/admin/ui'
import { CargarHub } from './CargarHub'

export default function CargarPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Cargar algo nuevo"
        help="¿Encontraste algo en internet para la app? Tocá qué es y te mostramos qué tener a mano y dónde cargarlo."
      />
      <CargarHub />
    </div>
  )
}
