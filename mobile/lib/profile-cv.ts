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
}

const COLUMNS = 'headline,current_org,education,country,bio,experience,specialties,socials'

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
  }
}

export async function saveProfileCV(userId: string, cv: ProfileCV): Promise<boolean> {
  const clean = (s: string) => s.trim() || null
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  return !error
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
