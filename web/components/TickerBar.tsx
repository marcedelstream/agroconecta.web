import Link from 'next/link'
import { postPath } from '@/lib/seo'
import type { PostRow } from '@/lib/types'

interface Props {
  posts: PostRow[]
}

export function TickerBar({ posts }: Props) {
  if (posts.length === 0) return null

  const items = posts.slice(0, 8)

  return (
    <div className="bg-lime text-bg overflow-hidden">
      <div className="site-container flex items-center h-9">
        <span className="shrink-0 font-display font-bold text-[11px] uppercase tracking-[0.14em] pr-4 mr-4 border-r border-bg/25">
          Al día
        </span>
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          <div className="ticker-track flex items-center gap-10 whitespace-nowrap w-max">
            {[...items, ...items].map((post, i) => (
              <Link
                key={`${post.id}-${i}`}
                href={postPath(post)}
                className="text-xs font-medium hover:underline shrink-0"
              >
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
