import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { isFeedSource, loadCandidate } from '@/lib/feed/item'
import type { FeedCandidate, FeedContentType } from '@/lib/feed/types'
import { absoluteUrl, truncateMeta } from '@/lib/seo'
import { APP_SCHEME, APP_STORE_ID, APP_STORE_URL, PLAY_STORE_URL } from '@/lib/store-links'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ source: string; id: string }>
}

const TYPE_LABEL: Record<FeedContentType, string> = {
  noticia: 'Noticia',
  video: 'Video',
  evento: 'Evento',
  curso: 'Curso',
  producto: 'Producto',
  servicio: 'Servicio',
  empleo: 'Empleo',
  remate: 'Remate',
  libro: 'Libro',
}

// Qué se puede hacer en la app con esta publicación: es el motivo para descargarla.
const APP_PERKS: Partial<Record<FeedContentType, string>> = {
  evento: 'Activá un recordatorio y te avisamos 1 hora antes.',
  remate: 'Activá un recordatorio y te avisamos cuando empiece.',
  curso: 'Guardalo y sumá puntos para canjear por cursos.',
  empleo: 'Guardalo y enterate de nuevas ofertas del agro.',
  libro: 'Leelo completo gratis y guardalo en tus colecciones.',
}
const DEFAULT_PERK = 'Guardala, seguí a quien la publica y recibí lo que te interesa del agro.'

async function load(params: Props['params']): Promise<FeedCandidate | null> {
  const { source, id } = await params
  if (!isFeedSource(source)) return null
  return loadCandidate(createSupabaseAdmin(), source, decodeURIComponent(id))
}

// Siempre con la dirección del título cuando existe; el id largo solo si la fuente no tiene slug.
const publicId = (c: FeedCandidate) => c.slug || c.sourceId

function sharePath(c: FeedCandidate) {
  return `/p/${c.source}/${encodeURIComponent(publicId(c))}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await load(params)
  if (!c) return { title: 'Publicación no encontrada' }
  const description = truncateMeta(c.summary || `${TYPE_LABEL[c.contentType]} de ${c.organizationName} en Agroconecta`)
  const image = c.mediaUrl && c.mediaKind === 'image' ? c.mediaUrl : absoluteUrl('/og-default.png')
  return {
    title: c.title,
    description,
    alternates: { canonical: sharePath(c) },
    openGraph: { title: c.title, description, url: absoluteUrl(sharePath(c)), images: [image], type: 'article' },
    twitter: { card: 'summary_large_image', title: c.title, description, images: [image] },
    // Safari en iPhone muestra arriba el banner "Abrir / Obtener" de la app.
    other: { 'apple-itunes-app': `app-id=${APP_STORE_ID}, app-argument=${APP_SCHEME}p/${c.source}/${encodeURIComponent(publicId(c))}` },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-PY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Asuncion',
  })
}

// Página pública de una publicación, la que se abre al compartir desde la app: muestra lo principal e
// invita a abrirla en la app o descargarla.
export default async function SharedItemPage({ params }: Props) {
  const c = await load(params)
  if (!c) notFound()
  // Si entraron con el id (links viejos), se redirige a la dirección con el título.
  const { id } = await params
  if (c.slug && decodeURIComponent(id) !== c.slug) permanentRedirect(sharePath(c))

  const appLink = `${APP_SCHEME}p/${c.source}/${encodeURIComponent(publicId(c))}`
  const image = c.mediaUrl && c.mediaKind === 'image' ? c.mediaUrl : null
  const details = [c.startsAt ? formatDate(c.startsAt) : null, c.location].filter(Boolean)

  return (
    <>
      <Header />

      <main className="site-container py-8 md:py-12 max-w-2xl">
        <article className="card p-0 overflow-hidden">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element -- imágenes de orígenes variados (Supabase, eventosagropy)
            <img src={image} alt="" className="w-full aspect-[16/9] object-cover" />
          )}
          <div className="p-6 space-y-3">
            <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em]">{TYPE_LABEL[c.contentType]}</p>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground leading-tight">{c.title}</h1>
            <p className="text-sm text-muted">{c.organizationName}</p>
            {details.length > 0 && <p className="text-sm text-foreground first-letter:uppercase">{details.join(' · ')}</p>}
            {c.summary && <p className="text-muted leading-relaxed">{c.summary}</p>}
            {c.source === 'post' && (
              <Link href={`/noticias/${publicId(c)}`} className="inline-block text-lime text-sm font-semibold hover:underline">
                Leer completo en la web →
              </Link>
            )}
          </div>
        </article>

        <section className="mt-6 rounded-2xl border border-lime/25 bg-lime/10 p-6 text-center">
          <h2 className="font-display font-semibold text-xl text-foreground">Seguilo en la app de Agroconecta</h2>
          <p className="text-muted text-sm mt-2">{APP_PERKS[c.contentType] ?? DEFAULT_PERK}</p>
          <a href={appLink} className="btn-primary mt-5 inline-flex">Abrir en la app</a>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
              Descargar en App Store
            </a>
            {PLAY_STORE_URL ? (
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                Descargar en Google Play
              </a>
            ) : (
              <Link href="/descargar" className="btn-ghost text-sm">Google Play — muy pronto</Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
