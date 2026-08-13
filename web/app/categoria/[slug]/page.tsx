import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { NewsCard } from '@/components/NewsCard'
import { HomeSidebar } from '@/components/HomeSidebar'
import { TickerBar } from '@/components/TickerBar'
import { createSupabaseServer } from '@/lib/supabase-server'
import { CATEGORY_LABELS, type NewsCategory, type PostRow } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

function isCategory(value: string): value is NewsCategory {
  return Object.keys(CATEGORY_LABELS).includes(value)
}

async function loadPosts(category: NewsCategory) {
  try {
    const supabase = await createSupabaseServer()
    const { data, error } = await supabase
      .from('posts')
      .select('id,slug,title,summary,content,category,target_departments,content_type,editorial_status,image_url,youtube_url,is_important,is_highlighted,published_at,created_at,organizations(name,logo_url,slug,is_verified)')
      .eq('editorial_status', 'published')
      .eq('category', category)
      .order('is_important', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(30)

    if (error) return []
    return (data ?? []) as unknown as PostRow[]
  } catch (error) {
    console.error('Category posts failed', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!isCategory(slug)) return { title: 'Categoría no encontrada' }
  const label = CATEGORY_LABELS[slug]

  return {
    title: label,
    description: `Últimas noticias de ${label.toLowerCase()} del sector agropecuario paraguayo.`,
    alternates: { canonical: `/categoria/${slug}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  if (!isCategory(slug)) notFound()

  const posts = await loadPosts(slug)
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <>
      <Header />
      <TickerBar posts={posts} />

      <main className="site-container py-8 md:py-10">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-2">Categoría</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight mb-6">
          {CATEGORY_LABELS[slug]}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
          <div>
            {featured && (
              <section className="mb-8">
                <NewsCard post={featured} featured />
              </section>
            )}

            {rest.length === 0 && !featured ? (
              <div className="card text-center py-12 text-muted">
                No hay publicaciones disponibles por ahora en esta categoría.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-7">
                {rest.map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 hidden lg:block">
            <HomeSidebar posts={posts} />
          </aside>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-sm font-semibold text-lime hover:text-lime-dark transition-colors">
            ← Ver todas las noticias
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
