import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppCta } from '@/components/site/AppCta'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { buildExploreCatalog } from '@/lib/feed/service'
import { EXPLORE_TYPES } from '@/lib/feed/explore'
import type { FeedCandidate, FeedContentType } from '@/lib/feed/types'
import { ExploreClient } from './ExploreClient'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Explorar el agro paraguayo',
  description: 'Buscá eventos, cursos, empleos, remates, noticias y más del agro paraguayo, todo en un lugar.',
  alternates: { canonical: '/explorar' },
}

interface Props {
  searchParams: Promise<{ q?: string; tipo?: string }>
}

// Solo lo que la tarjeta y los filtros necesitan: el catálogo viaja entero al navegador.
function slim(c: FeedCandidate): FeedCandidate {
  return {
    key: c.key,
    source: c.source,
    sourceId: c.sourceId,
    contentType: c.contentType,
    organizationId: null,
    organizationName: c.organizationName,
    organizationLogoUrl: null,
    title: c.title,
    summary: c.summary.slice(0, 200),
    mediaUrl: c.mediaUrl,
    mediaKind: c.mediaKind,
    youtubeUrl: null,
    tags: c.tags,
    targetDepartments: [],
    publishedAt: c.publishedAt,
    startsAt: c.startsAt,
    location: c.location,
    isLive: c.isLive,
  }
}

// Resultados del buscador de la portada y la sección Explorar: el mismo contenido y orden que la app.
export default async function ExplorarPage({ searchParams }: Props) {
  const { q = '', tipo } = await searchParams
  const type = EXPLORE_TYPES.includes(tipo as FeedContentType) ? (tipo as FeedContentType) : null
  const page = await buildExploreCatalog(createSupabaseAdmin(), null).catch(() => ({ items: [], trending: [] }))

  return (
    <>
      <Header />
      <main className="site-container py-8 md:py-12">
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-foreground tracking-tight mb-6">Explorá el agro</h1>
        <ExploreClient catalog={page.items.map(slim)} initialQuery={q.slice(0, 80)} initialType={type} />
        <div className="mt-14">
          <AppCta />
        </div>
      </main>
      <Footer />
    </>
  )
}
