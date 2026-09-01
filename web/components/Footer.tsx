import Link from 'next/link'
import { Logo } from './Logo'
import { SOCIAL_LINKS, WHATSAPP_NUMBER, WHATSAPP_URL } from '@/lib/social-links'

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
            <Link href="/aliados" className="text-muted hover:text-foreground transition-colors">Aliados</Link>
            <Link href="/quienes-somos" className="text-muted hover:text-foreground transition-colors">Quiénes somos</Link>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs text-muted uppercase tracking-wider font-display font-semibold">Seguinos</span>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
              >
                {social.label}
              </a>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground transition-colors"
            >
              WhatsApp · {WHATSAPP_NUMBER}
            </a>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs text-muted uppercase tracking-wider font-display font-semibold">Ayuda</span>
            <Link href="/soporte" className="text-muted hover:text-foreground transition-colors">Soporte</Link>
            <Link href="/politica" className="text-muted hover:text-foreground transition-colors">Política de privacidad</Link>
            <Link href="/copyright" className="text-muted hover:text-foreground transition-colors">Copyright</Link>
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
