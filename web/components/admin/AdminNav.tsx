'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ADMIN_NAV, isActive } from './nav-config'

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Secciones del panel">
      {ADMIN_NAV.map((group) => (
        <div key={group.label ?? 'inicio'} className="mb-1">
          {group.label && (
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-3 pt-4 pb-1.5">{group.label}</p>
          )}
          {group.items.map((item) => {
            const active = isActive(item, pathname)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-colors ${
                  active ? 'bg-lime/25 text-foreground font-semibold' : 'text-muted hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} className="shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

/** Menú lateral fijo en computadora. */
export function AdminSidebarNav() {
  return <NavLinks />
}

/** En el celular: botón "Menú" que abre el mismo menú en un panel lateral. */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost px-3 py-2 gap-2" aria-label="Abrir menú">
        <Menu size={20} aria-hidden /> Menú
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative w-72 max-w-[85%] h-full bg-surface p-3 overflow-y-auto shadow-xl">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost p-2 ml-auto flex" aria-label="Cerrar menú">
              <X size={20} aria-hidden />
            </button>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
