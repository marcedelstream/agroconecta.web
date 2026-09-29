'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from './nav-links'

// Menú del celular y tablet: botón redondo que despliega las secciones debajo de la cabecera.
export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        className="w-11 h-11 rounded-full border border-bdr bg-surface flex items-center justify-center"
      >
        <span className="relative block w-5 h-3.5" aria-hidden>
          <span className={`absolute left-0 right-0 h-0.5 bg-foreground rounded transition-all ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
          <span className={`absolute left-0 right-0 top-1.5 h-0.5 bg-foreground rounded transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`absolute left-0 right-0 h-0.5 bg-foreground rounded transition-all ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
        </span>
      </button>
      {open && (
        <nav className="absolute left-0 right-0 top-16 bg-surface border-b border-bdr shadow-lg" aria-label="Secciones">
          <div className="site-container py-3 flex flex-col">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="py-3 text-lg font-semibold text-foreground border-b border-bdr last:border-0">
                {label}
              </Link>
            ))}
            <Link href="/descargar" className="mt-3 mb-1 inline-flex justify-center rounded-full bg-navy text-white font-semibold px-4 py-3">
              Descargá la app
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}
