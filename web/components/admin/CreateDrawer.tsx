'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, X } from 'lucide-react'

interface Props {
  /** Texto del botón que lo abre, ej. "Nueva fuente". */
  label: string
  /** Título dentro del panel. */
  title: string
  /** Una línea opcional debajo del título. */
  description?: string
  children: React.ReactNode
}

// Formulario de alta en un panel que entra desde la derecha (rediseño del admin): la pantalla queda
// en una sola columna con la lista a lo ancho, y el formulario aparece solo cuando se lo pide.
export function CreateDrawer({ label, title, description, children }: Props) {
  const [open, setOpen] = useState(false)
  const params = useSearchParams()
  const feedback = params.get('ok') ?? params.get('error')

  // Las acciones vuelven a la misma pantalla con ?ok= / ?error=: al llegar el aviso se cierra el panel.
  useEffect(() => {
    if (feedback) setOpen(false)
  }, [feedback])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm gap-2">
        <Plus size={16} aria-hidden /> {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative flex h-full w-full sm:w-[520px] flex-col bg-bg shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-bdr bg-surface px-6 py-5">
              <div>
                <h2 className="font-display font-bold text-xl text-foreground">{title}</h2>
                {description && <p className="text-sm text-muted mt-1">{description}</p>}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost p-2" aria-label="Cerrar">
                <X size={20} aria-hidden />
              </button>
            </div>
            {/* Los formularios adentro quedan en una columna y sin su propia "tarjeta". */}
            <div className="admin-drawer-body flex-1 overflow-y-auto px-6 py-6">{children}</div>
            <div className="border-t border-bdr bg-surface px-6 py-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
