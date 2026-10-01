import Link from 'next/link'
import type { FeedCandidate } from '@/lib/feed/types'
import { itemPath, TYPE_LABEL } from '@/lib/feed/labels'

function when(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Asuncion' })
}

// Tarjeta de un resultado (Explorar, portada): lleva a /p/…, que muestra lo principal e invita a la app.
export function ResultCard({ item }: { item: FeedCandidate }) {
  const image = item.mediaKind !== 'none' ? item.mediaUrl : null
  const meta = [item.startsAt ? when(item.startsAt) : null, item.location].filter(Boolean).join(' · ')
  return (
    <Link href={itemPath(item)} className="group card p-0 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-[16/10] bg-secondary overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- imágenes de orígenes variados (Supabase, eventosagropy, YouTube)
          <img src={image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy to-[#1c3a2a]" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-lime text-[11px] font-bold uppercase tracking-[0.14em]">{TYPE_LABEL[item.contentType]}</p>
        <h3 className="font-display font-bold text-[17px] leading-snug text-foreground line-clamp-3">{item.title}</h3>
        <p className="text-sm text-muted mt-auto pt-1 line-clamp-1">{meta || item.organizationName}</p>
      </div>
    </Link>
  )
}
