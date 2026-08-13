import Link from 'next/link'
import type { PostRow } from '@/lib/types'
import { postPath } from '@/lib/seo'

interface Props {
  posts: PostRow[]
}

export function HomeSidebar({ posts }: Props) {
  const popular = posts.slice(0, 6)

  return (
    <div className="space-y-4">
      {popular.length > 0 && (
        <section className="card p-5">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-lime rounded-full shrink-0" />
            Más leídas
          </h2>
          <ol className="space-y-4">
            {popular.map((post, i) => (
              <li key={post.id}>
                <Link href={postPath(post)} className="flex items-start gap-3 group">
                  <span className="font-display font-bold text-2xl leading-none text-lime/40 group-hover:text-lime transition-colors shrink-0 w-6 pt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground leading-snug line-clamp-3 group-hover:text-lime transition-colors">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="rounded-2xl border border-lime/25 bg-lime/10 p-5">
        <p className="text-lime text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">Ecosistema</p>
        <h2 className="font-display font-semibold text-lg text-foreground">
          Una red para el agro paraguayo
        </h2>
        <p className="text-muted text-sm leading-relaxed mt-2">
          Precios, eventos, videos, biblioteca y aliados verificados — todo en la app Agroconecta.
        </p>
        <Link href="/ecosistema" className="text-xs font-semibold text-lime hover:text-lime-dark transition-colors mt-3 inline-block">
          Ver ecosistema →
        </Link>
      </section>
    </div>
  )
}
