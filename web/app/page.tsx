import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ShortsSection } from '@/components/ShortsSection'
import { AppCta } from '@/components/site/AppCta'
import { HeroSearch } from '@/components/site/HeroSearch'
import { HomeRow } from '@/components/site/HomeRow'
import { KaraiBlock } from '@/components/site/KaraiBlock'
import { ProblemBlock } from '@/components/site/ProblemBlock'
import { ServicesBlock } from '@/components/site/ServicesBlock'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { buildExploreCatalog } from '@/lib/feed/service'
import { sortByStart } from '@/lib/feed/ranking'
import type { FeedCandidate, FeedContentType } from '@/lib/feed/types'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Agroconecta — Todo el agro paraguayo en un solo lugar',
  description: 'Noticias, precios, eventos, remates, cursos y empleos del agro paraguayo. Buscá lo que necesitás o descargá la app de Agroconecta.',
  alternates: { canonical: '/' },
}

const ofType = (items: FeedCandidate[], types: FeedContentType[], n: number) => items.filter((c) => types.includes(c.contentType)).slice(0, n)

// Portada de la web oficial: primero el buscador; debajo, la landing de la app.
export default async function HomePage() {
  const { items } = await buildExploreCatalog(createSupabaseAdmin(), null).catch(() => ({ items: [] as FeedCandidate[] }))

  return (
    <>
      <Header />
      <main>
        <HeroSearch />

        <div className="site-container space-y-16 md:space-y-24 py-12 md:py-16">
          <ProblemBlock />

          <HomeRow title="Próximos eventos y remates" href="/explorar?tipo=evento" items={sortByStart(ofType(items, ['evento', 'remate'], 12)).slice(0, 4)} />
          <HomeRow title="Últimas noticias" href="/noticias" items={ofType(items, ['noticia', 'video'], 4)} />
          <HomeRow title="Cursos y oportunidades" href="/explorar?tipo=curso" items={ofType(items, ['curso', 'empleo', 'libro'], 4)} />

          <ShortsSection />

          <KaraiBlock />

          <section className="grid gap-6 md:grid-cols-2 items-center rounded-[28px] bg-surface border border-bdr p-8 md:p-12">
            <div>
              <p className="text-lime text-xs font-bold uppercase tracking-[0.2em]">Para organizaciones</p>
              <h2 className="font-display font-extrabold text-3xl text-foreground leading-tight mt-3">Llegá a todo el agro con tu organización</h2>
              <p className="text-muted text-lg mt-3 leading-relaxed">
                Gremios, medios, empresas e instituciones publican sus noticias y videos en el feed de Agroconecta, con
                seguidores propios y resultados.
              </p>
            </div>
            <div className="md:text-right">
              <Link href="/organizaciones" className="btn-primary px-6 py-3 text-base">Conocé el plan para organizaciones</Link>
            </div>
          </section>

          <ServicesBlock />

          <AppCta />
        </div>
      </main>
      <Footer />
    </>
  )
}
