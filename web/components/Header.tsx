import Link from 'next/link'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { NAV_LINKS } from './nav-links'

// Cabecera de la web oficial: misma línea que la app v2 (fondo claro, azul oscuro, verde de marca) y
// "Descargá la app" siempre a mano, porque el objetivo del sitio es llevar gente a la app.
export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-bdr">
      <div className="site-container flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center shrink-0" aria-label="Agroconecta, inicio">
          <Logo priority />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Secciones">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="px-3 py-2 rounded-full text-[15px] font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/descargar" className="hidden sm:inline-flex items-center rounded-full bg-navy text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy/90 transition-colors">
            Descargá la app
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
