'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Botón flotante "Descargá la app" (reemplaza la pestaña lateral). En el celular se ve el ícono con un
// texto corto; en pantallas grandes, el texto completo.
const HIDDEN_ON = ['/admin', '/karai', '/descargar']

export function AppDownloadButton() {
  const pathname = usePathname() ?? ''
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null

  return (
    <Link
      href="/descargar"
      aria-label="Descargá la app de Agroconecta"
      className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-40 inline-flex items-center gap-2.5 rounded-full bg-navy text-white pl-3 pr-5 h-14 shadow-[0_10px_30px_rgba(11,22,32,0.35)] hover:bg-navy/90 hover:-translate-y-0.5 transition-all"
    >
      <span className="w-9 h-9 rounded-full bg-brand text-navy flex items-center justify-center shrink-0" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5 18.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zM17 17H7V4h10z" />
        </svg>
      </span>
      <span className="font-display font-bold text-[15px]">
        <span className="sm:hidden">Bajá la app</span>
        <span className="hidden sm:inline">Descargá la app</span>
      </span>
    </Link>
  )
}
