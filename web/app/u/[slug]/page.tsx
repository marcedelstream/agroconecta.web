import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { absoluteUrl, truncateMeta } from '@/lib/seo'

// Perfil profesional público de la app v2 ("Compartir perfil"). Solo existe si el usuario lo activó
// (profiles.profile_public); nunca muestra email ni teléfono. Se lee con service role porque la RLS
// de profiles solo deja leer el propio perfil.

interface Props {
  params: Promise<{ slug: string }>
}

interface PublicProfile {
  name: string
  headline: string | null
  current_org: string | null
  education: string | null
  country: string | null
  bio: string | null
  experience: { role: string; org: string; period: string }[] | null
  specialties: string[] | null
  socials: Record<string, string> | null
}

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/
const SOCIAL_LABELS: Record<string, string> = { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', x: 'X', youtube: 'YouTube', website: 'Sitio web' }
const SOCIAL_BASE: Record<string, string> = {
  linkedin: 'https://www.linkedin.com/in/',
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  x: 'https://x.com/',
  youtube: 'https://www.youtube.com/@',
  website: 'https://',
}

function socialUrl(key: string, value: string) {
  const v = value.trim()
  return /^https?:\/\//i.test(v) ? v : `${SOCIAL_BASE[key] ?? 'https://'}${v.replace(/^@/, '')}`
}

async function loadProfile(slug: string): Promise<PublicProfile | null> {
  if (!SLUG_PATTERN.test(slug)) return null
  const { data } = await createSupabaseAdmin()
    .from('profiles')
    .select('name,headline,current_org,education,country,bio,experience,specialties,socials')
    .eq('slug', slug)
    .eq('profile_public', true)
    .maybeSingle()
  return (data as PublicProfile | null) ?? null
}

function headlineOf(p: PublicProfile) {
  return [p.headline, p.current_org].filter(Boolean).join(' — ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await loadProfile(slug)
  if (!p) return { title: 'Perfil no encontrado', robots: { index: false } }
  const description = truncateMeta(p.bio || headlineOf(p) || `Perfil de ${p.name} en Agroconecta`)
  const url = absoluteUrl(`/u/${slug}`)
  return {
    title: `${p.name} · Agroconecta`,
    description,
    alternates: { canonical: `/u/${slug}` },
    openGraph: { title: p.name, description, type: 'profile', url, images: [{ url: absoluteUrl('/og-default.png'), width: 1200, height: 630 }] },
    twitter: { card: 'summary', title: p.name, description },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params
  const p = await loadProfile(slug)
  if (!p) notFound()
  const socials = Object.entries(p.socials ?? {}).filter(([, v]) => v)

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <section className="space-y-2">
          <h1 className="font-display font-bold text-3xl">{p.name}</h1>
          {headlineOf(p) && <p className="text-lg font-semibold">{headlineOf(p)}</p>}
          <p className="text-muted">{[p.education, p.country].filter(Boolean).join(' · ')}</p>
        </section>

        {p.bio && (
          <section className="space-y-2">
            <h2 className="font-display font-semibold text-lg">Sobre mí</h2>
            <p className="leading-relaxed whitespace-pre-line">{p.bio}</p>
          </section>
        )}

        {p.experience && p.experience.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-lg">Experiencia</h2>
            <ul className="space-y-2">
              {p.experience.map((e, i) => (
                <li key={i}>
                  <p className="font-semibold">{e.role}</p>
                  <p className="text-muted text-sm">{[e.org, e.period].filter(Boolean).join(' · ')}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.specialties && p.specialties.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-display font-semibold text-lg">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {p.specialties.map((s) => <span key={s} className="rounded-full bg-lime/15 px-3 py-1 text-sm font-semibold">{s}</span>)}
            </div>
          </section>
        )}

        {socials.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-display font-semibold text-lg">Redes sociales</h2>
            <div className="flex flex-wrap gap-3">
              {socials.map(([k, v]) => (
                <a key={k} href={socialUrl(k, v)} target="_blank" rel="noopener noreferrer nofollow" className="text-lime underline">{SOCIAL_LABELS[k] ?? k}</a>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
