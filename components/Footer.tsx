import Link from 'next/link'
import { Logo } from './Logo'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-bdr mt-20">
      <div className="site-container py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Logo width={120} height={36} className="h-7 w-auto mb-3" />
            <p className="text-muted text-sm max-w-xs">
              Noticias agropecuarias segmentadas para Paraguay.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs text-muted uppercase tracking-wider font-display font-semibold">Portal</span>
            <Link href="/" className="text-muted hover:text-foreground transition-colors">Noticias</Link>
            <Link href="/ecosistema" className="text-muted hover:text-foreground transition-colors">Ecosistema</Link>
            <Link href="/quienes-somos" className="text-muted hover:text-foreground transition-colors">Quiénes somos</Link>
          </div>
        </div>

        <div className="border-t border-bdr mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>© {year} Agroconecta. Todos los derechos reservados.</span>
          <span>Hecho para el campo paraguayo.</span>
        </div>
      </div>
    </footer>
  )
}
