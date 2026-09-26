import type { Metadata } from 'next'
import { NotificationsForm } from './NotificationsForm'
import { PageHeader } from '@/components/admin/ui'

export const metadata: Metadata = { title: 'Notificaciones — Admin Agroconecta' }

export default function NotificacionesPage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Notificaciones" help="Mandá un aviso al teléfono de los usuarios de la app. Llega al instante y no se puede deshacer." />

      <div className="rounded-xl border border-bdr bg-surface p-6 mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-1">Envío automático</h2>
        <p className="text-xs text-muted leading-relaxed">
          Cuando aprobás una publicación marcada como <span className="text-lime font-medium">Importante</span>,
          la app envía automáticamente una notificación push a todos los dispositivos registrados con el
          título y el resumen de la nota. No requiere acción adicional.
        </p>
      </div>

      <div className="rounded-xl border border-bdr bg-surface p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Envío manual</h2>
        <NotificationsForm />
      </div>
    </div>
  )
}
