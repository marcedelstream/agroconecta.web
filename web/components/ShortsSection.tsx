import { loadLatestShorts } from '@/lib/youtube'
import { ShortCard } from './ShortCard'

export async function ShortsSection() {
  const shorts = await loadLatestShorts(8)
  if (shorts.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t border-bdr">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl text-foreground">Shorts de Agroconecta</h2>
        <a
          href="https://www.youtube.com/@agroconectapy/shorts"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-lime hover:text-lime-dark transition-colors shrink-0"
        >
          Ver canal →
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {shorts.map((short) => (
          <ShortCard key={short.id} {...short} />
        ))}
      </div>
    </section>
  )
}
