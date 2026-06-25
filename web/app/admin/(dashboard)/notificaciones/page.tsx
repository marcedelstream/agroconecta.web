import type { Metadata } from 'next'
import { NotificationsForm } from './NotificationsForm'

export const metadata: Metadata = { title: 'Notificaciones — Admin Agroconecta' }

export default function NotificacionesPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-white mb-1">Notificaciones</h1>
        <p className="text-sm text-muted">
          Enviá un mensaje push a todos los dispositivos registrados en la app.
        </p>
      </div>

      <div className="rounded-xl border border-bdr bg-surface p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-1">Envío automático</h2>
        <p className="text-xs text-muted leading-relaxed">
          Cuando aprobás una publicación marcada como <span className="text-lime font-medium">Importante</span>,
          la app envía automáticamente una notificación push a todos los dispositivos registrados con el
          título y el resumen de la nota. No requiere acción adicional.
        </p>
      </div>

      <div className="rounded-xl border border-bdr bg-surface p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Envío manual</h2>
        <NotificationsForm />
      </div>
    </div>
  )
}
