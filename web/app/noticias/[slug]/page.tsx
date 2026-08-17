import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CategoryEyebrow } from '@/components/CategoryEyebrow'
import { NewsCard } from '@/components/NewsCard'
import { VideoBanner } from '@/components/VideoBanner'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { NewsCategory, PostRow } from '@/lib/types'
import { absoluteUrl, isUuid, postPath, postUrl, truncateMeta } from '@/lib/seo'
import { normalizeArticleHtml } from '@/lib/content-html'

interface Props {
  params: Promise<{ slug: string }>
}

async function loadPost(slug: string) {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('posts')
    .select('id,slug,title,summary,content,category,target_departments,content_type,editorial_status,image_url,youtube_url,is_important,published_at,created_at,organizations(name,logo_url,slug,is_verified)')
    .eq(isUuid(slug) ? 'id' : 'slug', slug)
    .eq('editorial_status', 'published')
    .single()
  return data as PostRow | null
}

async function loadRelated(post: PostRow) {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('posts')
    .select('id,slug,title,summary,content,category,target_departments,content_type,editorial_status,image_url,youtube_url,is_important,published_at,created_at,organizations(name,logo_url,slug,is_verified)')
    .eq('editorial_status', 'published')
    .eq('category', post.category)
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3)
  return (data ?? []) as unknown as PostRow[]
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function youtubeEmbedUrl(url: string) {
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/')
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
  return url
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) return { title: 'Artículo no encontrado' }

  const description = truncateMeta(post.summary || post.content)
  const url = postUrl(post)
  const images = post.image_url
    ? [{ url: post.image_url, width: 1200, height: 630, alt: post.title }]
    : [{ url: absoluteUrl('/og-default.png'), width: 1200, height: 630, alt: 'Agroconecta — Una nueva forma de vivir el agro' }]

  return {
    title: post.title,
    description,
    alternates: {
      canonical: postPath(post),
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.published_at ?? post.created_at,
      authors: post.organizations?.name ? [post.organizations.name] : ['Agroconecta'],
      images,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: images.map((image) => image.url),
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) notFound()

  const related = await loadRelated(post)
  const org = post.organizations
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-PY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null
  const canonicalUrl = postUrl(post)
  const description = truncateMeta(post.summary || post.content)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description,
    image: post.image_url ? [post.image_url] : undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.published_at ?? post.created_at,
    author: {
      '@type': 'Organization',
      name: org?.name ?? 'Agroconecta',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Agroconecta',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo-dark.png'),
      },
    },
    mainEntityOfPage: canonicalUrl,
  }

  return (
    <>
      <Header />

      <main className="site-container py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <VideoBanner className="mb-6" />

        <Link href="/" className="text-muted text-sm hover:text-foreground transition-colors inline-flex items-center gap-1.5 mb-6 max-w-3xl mx-auto lg:mx-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11 12.5L6.5 8 11 3.5 9.5 2l-6 6 6 6z" /></svg>
          Volver a noticias
        </Link>

        <header className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CategoryEyebrow category={post.category as NewsCategory} size="lg" />
            {post.is_important && (
              <span className="badge bg-danger text-white text-xs font-semibold">Importante</span>
            )}
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-[1.08] text-foreground">
            {post.title}
          </h1>
          {post.summary && (
            <p className="text-muted text-lg md:text-xl mt-5 leading-relaxed">{post.summary}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-bdr text-sm text-muted">
            {org && (
              <div className="flex items-center gap-2">
                {org.logo_url && (
                  <Image src={org.logo_url} alt={org.name} width={28} height={28} className="rounded-md w-7 h-7 object-cover" />
                )}
                <span className="text-foreground font-medium">Por {org.name}</span>
                {org.is_verified && (
                  <span title="Organización verificada" className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/70 shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
            )}
            {dateStr && <time dateTime={post.published_at ?? post.created_at}>{dateStr}</time>}
            <span>{readingTime(post.content)} min de lectura</span>
          </div>
        </header>

        {post.image_url && (
          <div className="relative w-full aspect-[16/9] max-w-4xl mx-auto rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 900px"
              priority
            />
          </div>
        )}

        <article className="max-w-3xl mx-auto">
          {post.youtube_url && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8">
              <iframe
                src={youtubeEmbedUrl(post.youtube_url)}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          <div
            className="prose prose-invert prose-lg max-w-none text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(post.content) }}
          />

          <div className="mt-12 pt-8 border-t border-bdr">
            <p className="text-muted text-sm mb-3">Compartir</p>
            <div className="flex gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${canonicalUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-xs"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(canonicalUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-xs"
              >
                Twitter / X
              </a>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="max-w-4xl mx-auto mt-14 pt-10 border-t border-bdr">
            <h2 className="font-display font-bold text-xl text-foreground mb-5">Seguí leyendo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-7">
              {related.map((item) => (
                <NewsCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
