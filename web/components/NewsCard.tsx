import Link from 'next/link'
import Image from 'next/image'
import { CategoryEyebrow } from './CategoryEyebrow'
import type { PostRow, NewsCategory } from '@/lib/types'
import { postPath } from '@/lib/seo'

interface Props {
  post: PostRow
  featured?: boolean
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'hace unos minutos'
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d}d`
  return new Date(iso).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })
}

function VerifiedBadge() {
  return (
    <span
      title="Organización verificada"
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/70 shrink-0"
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function Byline({ post }: { post: PostRow }) {
  const org = post.organizations ?? null
  const date = post.published_at ?? post.created_at

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted min-w-0">
      {org ? (
        <span className="flex items-center gap-1.5 truncate min-w-0">
          <span className="truncate">Por {org.name}</span>
          {org.is_verified && <VerifiedBadge />}
        </span>
      ) : (
        <span>Agroconecta</span>
      )}
      <span className="shrink-0">·</span>
      <span className="shrink-0">{timeAgo(date ?? '')}</span>
    </div>
  )
}

export function NewsCard({ post, featured = false }: Props) {
  const href = postPath(post)

  if (featured) {
    return (
      <Link href={href} className="block group">
        <article>
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-secondary">
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-secondary" />
            )}
            {post.is_important && (
              <span className="absolute top-4 left-4 badge bg-danger text-white font-semibold">
                Importante
              </span>
            )}
          </div>

          <div className="mt-4">
            <CategoryEyebrow category={post.category as NewsCategory} size="lg" />
            <h2 className="font-display font-bold text-2xl md:text-4xl text-foreground mt-2 leading-tight group-hover:text-lime transition-colors">
              {post.title}
            </h2>
            {post.summary && (
              <p className="text-muted text-base mt-3 leading-relaxed max-w-2xl line-clamp-2">
                {post.summary}
              </p>
            )}
            <div className="mt-3">
              <Byline post={post} />
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="block group h-full">
      <article className="flex flex-col h-full">
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-secondary mb-3">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 320px"
            />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
          {post.is_important && (
            <span className="absolute top-2.5 left-2.5 badge bg-danger text-white text-[10px] font-semibold">
              Importante
            </span>
          )}
        </div>

        <CategoryEyebrow category={post.category as NewsCategory} />
        <h3 className="font-display font-semibold text-sm md:text-base text-foreground mt-1.5 leading-snug line-clamp-3 group-hover:text-lime transition-colors">
          {post.title}
        </h3>
        <div className="mt-auto pt-2">
          <Byline post={post} />
        </div>
      </article>
    </Link>
  )
}
