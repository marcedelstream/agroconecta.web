import Link from 'next/link'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { href: '/', label: 'Noticias' },
  { href: '/precios', label: 'Precios' },
  { href: '/ecosistema', label: 'Ecosistema' },
  { href: '/quienes-somos', label: 'Nosotros' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-bdr">
      <div className="site-container flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo priority />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative py-1 text-sm font-medium uppercase tracking-[0.08em] text-foreground/80 transition-colors hover:text-lime"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/ecosistema"
            className="hidden sm:inline-flex btn-primary py-1.5 px-3.5 text-xs"
          >
            Descargá la app
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <nav className="md:hidden border-t border-bdr overflow-x-auto scrollbar-hide">
        <div className="site-container flex items-center gap-5 h-11">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 text-xs font-medium uppercase tracking-[0.08em] text-foreground/80 hover:text-lime transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
