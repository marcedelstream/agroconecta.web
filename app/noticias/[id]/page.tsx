import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CategoryBadge } from '@/components/CategoryBadge'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { NewsCategory, PostRow } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

async function loadPost(id: string) {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('posts')
    .select('id,title,summary,content,category,target_departments,content_type,editorial_status,image_url,youtube_url,is_important,published_at,created_at,organizations(name,logo_url,slug,is_verified)')
    .eq('id', id)
    .eq('editorial_status', 'published')
    .single()
  return data as PostRow | null
}

function youtubeEmbedUrl(url: string) {
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/')
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
  return url
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const post = await loadPost(id)
  if (!post) return { title: 'Artículo no encontrado' }
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.image_url ? [post.image_url] : [],
      url: `https://agroconecta.com.py/noticias/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: post.image_url ? [post.image_url] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params
  const post = await loadPost(id)
  if (!post) notFound()

  const org = post.organizations
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-PY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null
  const canonicalUrl = `https://agroconecta.com.py/noticias/${post.id}`

  return (
    <>
      <Header />

      <main className="site-container py-10">
        <Link href="/" className="text-muted text-sm hover:text-foreground transition-colors inline-flex items-center gap-1.5 mb-6">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11 12.5L6.5 8 11 3.5 9.5 2l-6 6 6 6z" /></svg>
          Volver a noticias
        </Link>

        <article className="max-w-3xl mx-auto">
          <header className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CategoryBadge category={post.category as NewsCategory} size="md" />
              {post.is_important && (
                <span className="badge bg-danger/20 text-danger text-xs font-semibold">Importante</span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl md:text-4xl leading-tight text-foreground">
              {post.title}
            </h1>
            <p className="text-muted text-lg mt-4 leading-relaxed">{post.summary}</p>

            <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-bdr text-sm text-muted">
              {org && (
                <div className="flex items-center gap-2">
                  {org.logo_url && (
                    <Image src={org.logo_url} alt={org.name} width={24} height={24} className="rounded-md w-6 h-6 object-cover" />
                  )}
                  <span>{org.name}</span>
                  {org.is_verified && (
                    <span title="Organización verificada" className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-lime shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
              )}
              {dateStr && <span>{dateStr}</span>}
            </div>
          </header>

          {post.image_url && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

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
            dangerouslySetInnerHTML={{ __html: post.content }}
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
      </main>

      <Footer />
    </>
  )
}

