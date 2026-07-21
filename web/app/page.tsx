import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { NewsCard } from '@/components/NewsCard'
import { CategoryBadge } from '@/components/CategoryBadge'
import { HomeSidebar } from '@/components/HomeSidebar'
import { createSupabaseServer } from '@/lib/supabase-server'
import { CATEGORY_LABELS, type NewsCategory, type PostRow } from '@/lib/types'

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as NewsCategory[]

export const metadata: Metadata = {
  title: 'Noticias agropecuarias del Paraguay',
  description: 'Noticias, precios, eventos y contenidos del ecosistema Agroconecta para el sector agropecuario paraguayo.',
  alternates: {
    canonical: '/',
  },
}

interface Props {
  searchParams: Promise<{ categoria?: string }>
}

function isCategory(value: string | undefined): value is NewsCategory {
  return ALL_CATEGORIES.includes(value as NewsCategory)
}

async function loadAvailableCategories() {
  try {
    const supabase = await createSupabaseServer()
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .eq('editorial_status', 'published')
      .limit(200)

    if (error) return []

    return Array.from(
      new Set(
        (data ?? [])
          .map((row) => row.category)
          .filter((category): category is NewsCategory => isCategory(category))
      )
    )
  } catch (error) {
    console.error('Home categories failed', error)
    return []
  }
}

async function loadPosts(category?: NewsCategory) {
  try {
    const supabase = await createSupabaseServer()
    let query = supabase
      .from('posts')
      .select('id,slug,title,summary,content,category,target_departments,content_type,editorial_status,image_url,youtube_url,is_important,is_highlighted,published_at,created_at,organizations(name,logo_url,slug,is_verified)')
      .eq('editorial_status', 'published')
      .order('is_important', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(24)

    if (category) query = query.eq('category', category)

    const { data, error } = await query
    if (error) return []
    return (data ?? []) as unknown as PostRow[]
  } catch (error) {
    console.error('Home posts failed', error)
    return []
  }
}

export default async function HomePage({ searchParams }: Props) {
  const { categoria } = await searchParams
  const requestedCategory = isCategory(categoria) ? categoria : undefined
  const [availableCategories, posts] = await Promise.all([
    loadAvailableCategories(),
    loadPosts(requestedCategory),
  ])
  const activeCategory = requestedCategory
  const featured = posts.find((p) => p.is_highlighted) ?? posts[0]
  const rest = posts.filter((p) => p.id !== featured?.id)

  return (
    <>
      <Header />

      <main className="site-container py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
          <div>
            <section className="mb-7">
              <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Noticias
              </p>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight">
                Agroconecta: información y ecosistema para el campo
              </h1>
              <p className="text-muted text-base mt-3 max-w-2xl">
                Actualidad del sector, instituciones y organizaciones verificadas de Paraguay.
              </p>
            </section>

            <section className="mb-7 rounded-2xl border border-lime/25 bg-lime/10 p-5">
              <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-2">App Agroconecta</p>
              <h2 className="font-display font-semibold text-xl text-foreground">Descargá la app para más información</h2>
              <p className="text-muted text-sm leading-relaxed mt-2 max-w-2xl">
                En la app vas a encontrar perfil, notificaciones, biblioteca, seguimiento de medios, eventos y navegación diaria del ecosistema.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="badge bg-lime text-bg">iOS</span>
                <span className="badge bg-lime text-bg">Android</span>
              </div>
            </section>

            {featured && (
              <section className="mb-6">
                <NewsCard post={featured} featured />
              </section>
            )}

            {availableCategories.length > 0 && (
              <nav className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide" aria-label="Filtros de noticias">
                <Link
                  href="/"
                  className={`badge shrink-0 py-1.5 px-3 text-xs font-medium ${!activeCategory ? 'bg-lime text-bg' : 'bg-lime/15 text-lime'}`}
                >
                  Todos
                </Link>
                {availableCategories.map((cat) => (
                  <Link key={cat} href={`/?categoria=${cat}`} className="shrink-0">
                    <CategoryBadge category={cat} active={activeCategory === cat} />
                  </Link>
                ))}
              </nav>
            )}

            <section>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-display font-semibold text-lg text-foreground">
                  {activeCategory ? CATEGORY_LABELS[activeCategory] : 'Más recientes'}
                </h2>
                <p className="text-muted text-sm">{posts.length} publicadas</p>
              </div>

              {rest.length === 0 && !featured ? (
                <div className="card text-center py-12 text-muted">
                  No hay publicaciones disponibles por ahora.
                </div>
              ) : rest.length === 0 ? (
                <div className="card text-center py-10 text-muted">
                  No hay más publicaciones para este filtro.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rest.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 hidden lg:block">
            <HomeSidebar />
          </aside>
        </div>
      </main>

      <Footer />
    </>
  )
}
