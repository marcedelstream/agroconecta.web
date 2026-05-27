import Link from 'next/link'
import Image from 'next/image'
import { CategoryBadge } from './CategoryBadge'
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
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-lime shrink-0"
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function NewsCard({ post, featured = false }: Props) {
  const org = post.organizations ?? null
  const date = post.published_at ?? post.created_at
  const href = postPath(post)

  if (featured) {
    return (
      <Link href={href} className="block group">
        <article className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <CategoryBadge category={post.category as NewsCategory} size="md" />
            <h2 className="font-display font-semibold text-2xl md:text-3xl text-white mt-3 leading-tight line-clamp-2">
              {post.title}
            </h2>
            <p className="text-white/70 text-sm mt-2 line-clamp-2 hidden md:block">{post.summary}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
              {org && (
                <span className="flex items-center gap-1 min-w-0">
                  {org.logo_url && (
                    <Image src={org.logo_url} alt={org.name} width={16} height={16} className="rounded w-4 h-4 object-cover" />
                  )}
                  <span className="truncate">{org.name}</span>
                  {org.is_verified && <VerifiedBadge />}
                </span>
              )}
              <span className="shrink-0">{timeAgo(date ?? '')}</span>
            </div>
          </div>
          {post.is_important && (
            <span className="absolute top-4 left-4 badge bg-danger/20 text-danger font-semibold">
              Importante
            </span>
          )}
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="block group h-full">
      <article className="card flex gap-4 hover:border-bdr/60 transition-colors h-full">
        {post.image_url && (
          <div className="relative w-24 h-24 md:w-28 md:h-24 shrink-0 rounded-lg overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
        )}
        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div>
            <CategoryBadge category={post.category as NewsCategory} />
            <h3 className="font-display font-semibold text-sm md:text-base text-foreground mt-1.5 line-clamp-2 group-hover:text-lime transition-colors">
              {post.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
            {org && (
              <span className="flex items-center gap-1 truncate min-w-0">
                {org.logo_url && (
                  <Image src={org.logo_url} alt={org.name} width={14} height={14} className="rounded w-3.5 h-3.5 object-cover shrink-0" />
                )}
                <span className="truncate">{org.name}</span>
                {org.is_verified && <VerifiedBadge />}
              </span>
            )}
            <span className="shrink-0">{timeAgo(date ?? '')}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
