import { supabase } from './supabase'

// Perfil tipo CV profesional de la v2 (supabase/fix-v2-profile.sql). Se lee y escribe directo de
// `profiles` (RLS de dueño), sin pasar por el cache de AsyncStorage: así siempre está completo en
// cualquier dispositivo, sin depender de la hidratación del perfil local.

export interface ExperienceEntry {
  role: string
  org: string
  period: string
}

export const SOCIAL_KEYS = ['linkedin', 'instagram', 'facebook', 'x', 'youtube', 'website'] as const
export type SocialKey = (typeof SOCIAL_KEYS)[number]
export type Socials = Partial<Record<SocialKey, string>>

export interface ProfileCV {
  headline: string
  currentOrg: string
  education: string
  country: string
  bio: string
  experience: ExperienceEntry[]
  specialties: string[]
  socials: Socials
  /** Perfil público web (/u/<slug>): apagado por defecto, lo activa el usuario. */
  slug: string
  profilePublic: boolean
}

export const PUBLIC_PROFILE_BASE = 'https://www.agroconecta.com.py/u/'
// Mismo formato que el check de la base (supabase/fix-v2-profile.sql).
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/

export function normalizeSlug(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

export const EMPTY_CV: ProfileCV = {
  headline: '',
  currentOrg: '',
  education: '',
  country: 'Paraguay',
  bio: '',
  experience: [],
  specialties: [],
  socials: {},
  slug: '',
  profilePublic: false,
}

interface CvRow {
  headline: string | null
  current_org: string | null
  education: string | null
  country: string | null
  bio: string | null
  experience: ExperienceEntry[] | null
  specialties: string[] | null
  socials: Socials | null
  slug: string | null
  profile_public: boolean | null
}

const COLUMNS = 'headline,current_org,education,country,bio,experience,specialties,socials,slug,profile_public'

export async function fetchProfileCV(userId: string): Promise<ProfileCV> {
  const { data, error } = await supabase.from('profiles').select(COLUMNS).eq('id', userId).maybeSingle()
  // Si la migración todavía no se corrió, la consulta falla: se muestra el CV vacío en vez de romper.
  if (error || !data) return EMPTY_CV
  const r = data as CvRow
  return {
    headline: r.headline ?? '',
    currentOrg: r.current_org ?? '',
    education: r.education ?? '',
    country: r.country ?? EMPTY_CV.country,
    bio: r.bio ?? '',
    experience: Array.isArray(r.experience) ? r.experience : [],
    specialties: r.specialties ?? [],
    socials: r.socials ?? {},
    slug: r.slug ?? '',
    profilePublic: r.profile_public ?? false,
  }
}

export type SaveCvResult = 'ok' | 'slug_taken' | 'slug_invalid' | 'error'

export async function saveProfileCV(userId: string, cv: ProfileCV): Promise<SaveCvResult> {
  const clean = (s: string) => s.trim() || null
  const slug = normalizeSlug(cv.slug)
  if (cv.profilePublic && !isValidSlug(slug)) return 'slug_invalid'
  const { error } = await supabase
    .from('profiles')
    .update({
      headline: clean(cv.headline),
      current_org: clean(cv.currentOrg),
      education: clean(cv.education),
      country: cv.country.trim() || EMPTY_CV.country,
      bio: clean(cv.bio),
      experience: cv.experience.filter((e) => e.role.trim() || e.org.trim()),
      specialties: cv.specialties.map((s) => s.trim()).filter(Boolean),
      socials: Object.fromEntries(Object.entries(cv.socials).filter(([, v]) => v && v.trim())),
      slug: isValidSlug(slug) ? slug : null,
      profile_public: cv.profilePublic && isValidSlug(slug),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  // 23505 = el índice único de slug: esa dirección ya la usa otra persona.
  if (error?.code === '23505') return 'slug_taken'
  return error ? 'error' : 'ok'
}

/** "@usuario" o "usuario" → URL completa de la red. Lo que ya es URL queda igual. */
export function socialUrl(key: SocialKey, value: string): string {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v
  const handle = v.replace(/^@/, '')
  const base: Record<SocialKey, string> = {
    linkedin: 'https://www.linkedin.com/in/',
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    x: 'https://x.com/',
    youtube: 'https://www.youtube.com/@',
    website: 'https://',
  }
  return `${base[key]}${handle}`
}
