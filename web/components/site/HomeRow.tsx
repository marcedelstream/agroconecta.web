import Link from 'next/link'
import type { FeedCandidate } from '@/lib/feed/types'
import { ResultCard } from './ResultCard'

// Fila de la portada: título + "Ver todo" + hasta 4 tarjetas. Si no hay contenido no se muestra.
export function HomeRow({ title, href, items }: { title: string; href: string; items: FeedCandidate[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground tracking-tight">{title}</h2>
        <Link href={href} className="text-sm font-bold text-lime hover:text-lime-dark shrink-0">Ver todo →</Link>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c) => (
          <ResultCard key={c.key} item={c} />
        ))}
      </div>
    </section>
  )
}
