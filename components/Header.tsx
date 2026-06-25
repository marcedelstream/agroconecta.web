import Link from 'next/link'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { href: '/', label: 'Noticias' },
  { href: '/ecosistema', label: 'Ecosistema' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-bdr">
      <div className="site-container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Logo priority />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-lg text-sm text-foreground bg-secondary transition-colors hover:bg-lime/15 hover:text-lime"
            >
              {label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
