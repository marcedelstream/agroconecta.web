'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppDownloadTab() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/karai')) return null

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center">
      <div
        className={`transition-all duration-200 origin-right ${
          open ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-3 pointer-events-none'
        }`}
      >
        <div className="w-64 max-w-[78vw] card shadow-xl mr-2 p-4">
          <p className="text-lime text-[11px] font-semibold uppercase tracking-[0.16em] mb-1.5">
            App Agroconecta
          </p>
          <h2 className="font-display font-semibold text-base text-foreground leading-snug">
            Llevá el agro paraguayo en el bolsillo
          </h2>
          <p className="text-muted text-xs leading-relaxed mt-2">
            Perfil, notificaciones, biblioteca, eventos y navegación diaria del ecosistema.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="badge bg-lime text-bg">iOS</span>
            <span className="badge bg-lime text-bg">Android</span>
          </div>
          <Link
            href="/ecosistema"
            onClick={() => setOpen(false)}
            className="btn-primary w-full mt-3 text-xs"
          >
            Conocer el ecosistema
          </Link>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Descargá la app Agroconecta"
        className="bg-lime text-bg rounded-l-xl shadow-lg px-2 py-4 flex flex-col items-center gap-2 hover:bg-lime-dark transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5 18.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zM17 17H7V4h10z" />
        </svg>
        <span
          className="font-display font-bold text-[11px] uppercase tracking-[0.14em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          Descargá la app
        </span>
      </button>
    </div>
  )
}
