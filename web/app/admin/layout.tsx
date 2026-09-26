import { Figtree } from 'next/font/google'

// Figtree solo en el panel (la web pública sigue con Lexend). La clase .admin-root (globals.css) usa
// esta variable y deja todo el panel en tema claro, sin depender del toggle de la web.
const figtree = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-figtree', display: 'swap' })

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${figtree.variable} admin-root min-h-screen bg-bg`}>{children}</div>
}
