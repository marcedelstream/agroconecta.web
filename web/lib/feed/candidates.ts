import type { SupabaseClient } from '@supabase/supabase-js'
import { eventStartIso, toSlug, youtubeThumbnail } from './normalize'
import type { FeedCandidate, FeedContentType } from './types'

// Carga los candidatos del feed desde sus tres fuentes y los normaliza a FeedCandidate. Cada fuente
// es best-effort: si una falla (tabla sin migrar, base de eventos caída) el feed sale con las otras.

const POSTS_WINDOW_DAYS = 60
const POSTS_LIMIT = 200
const LISTINGS_LIMIT = 100
const EVENTS_LIMIT = 60
const EVENTS_FALLBACK_ORG = 'Eventos Agro'

interface PostRow {
  id: string
  organization_id: string
  title: string
  summary: string
  category: string
  target_departments: string[] | null
  content_type: 'article' | 'video' | 'auction' | 'institutional_notice'
  image_url: string | null
  youtube_url: string | null
  auction_status: 'upcoming' | 'live' | 'finished' | 'unavailable' | null
  starts_at: string | null
  published_at: string | null
  organizations: { name: string; logo_url: string | null } | null
}

interface ListingRow {
  id: string
  kind: 'empleo' | 'clasificado' | 'curso'
  title: string
  description: string
  image_url: string | null
  category_label: string
  publisher_name: string
  location: string
  published_at: string
}

interface EventRow {
  id: string
  slug: string
  title: string
  description: string | null
  category: string | null
  date: string
  time: string | null
  location: string | null
  city: string | null
  department: string | null
  image_url: string | null
  organization_id: string | null
  created_at: string
}

interface EventOrgRow {
  id: string
  name?: string | null
  logo_url?: string | null
}

const POST_TYPE: Record<PostRow['content_type'], FeedContentType> = {
  article: 'noticia',
  institutional_notice: 'noticia',
  video: 'video',
  auction: 'remate',
}

const LISTING_TYPE: Record<ListingRow['kind'], FeedContentType> = {
  empleo: 'empleo',
  clasificado: 'producto',
  curso: 'curso',
}

export async function loadPostCandidates(db: SupabaseClient, asOf: Date): Promise<FeedCandidate[]> {
  const since = new Date(asOf.getTime() - POSTS_WINDOW_DAYS * 86_400_000).toISOString()
  const { data, error } = await db
    .from('posts')
    .select(
      'id,organization_id,title,summary,category,target_departments,content_type,image_url,youtube_url,auction_status,starts_at,published_at,organizations(name,logo_url)',
    )
    .eq('editorial_status', 'published')
    .gte('published_at', since)
    .lte('published_at', asOf.toISOString())
    .order('published_at', { ascending: false })
    .limit(POSTS_LIMIT)

  if (error) {
    console.error('feed: posts falló:', error.message)
    return []
  }

  return (data as unknown as PostRow[])
    .filter((r) => r.auction_status !== 'finished' && r.auction_status !== 'unavailable')
    .map((r) => {
      const thumb = r.image_url ?? youtubeThumbnail(r.youtube_url)
      return {
        key: `post:${r.id}`,
        source: 'post' as const,
        sourceId: r.id,
        contentType: POST_TYPE[r.content_type],
        organizationId: r.organization_id,
        organizationName: r.organizations?.name ?? '',
        organizationLogoUrl: r.organizations?.logo_url ?? null,
        title: r.title,
        summary: r.summary,
        mediaUrl: thumb,
        mediaKind: r.youtube_url ? ('youtube' as const) : thumb ? ('image' as const) : ('none' as const),
        youtubeUrl: r.youtube_url,
        tags: [r.category],
        targetDepartments: r.target_departments ?? [],
        publishedAt: r.published_at ?? asOf.toISOString(),
        startsAt: r.starts_at,
        location: null,
        isLive: r.auction_status === 'live',
      }
    })
}

export async function loadListingCandidates(db: SupabaseClient, asOf: Date): Promise<FeedCandidate[]> {
  const { data, error } = await db
    .from('ecosystem_listings')
    .select('id,kind,title,description,image_url,category_label,publisher_name,location,published_at')
    .eq('is_active', true)
    .lte('published_at', asOf.toISOString())
    .order('published_at', { ascending: false })
    .limit(LISTINGS_LIMIT)

  if (error) {
    console.error('feed: ecosystem_listings falló:', error.message)
    return []
  }

  return (data as ListingRow[]).map((r) => ({
    key: `listing:${r.id}`,
    source: 'listing' as const,
    sourceId: r.id,
    contentType: LISTING_TYPE[r.kind],
    // Los listings no tienen organización propia: se agrupan por publicador para la regla de mezcla.
    organizationId: null,
    organizationName: r.publisher_name,
    organizationLogoUrl: null,
    title: r.title,
    summary: r.description,
    mediaUrl: r.image_url,
    mediaKind: r.image_url ? ('image' as const) : ('none' as const),
    youtubeUrl: null,
    tags: [toSlug(r.category_label)].filter((t): t is string => t !== null),
    targetDepartments: [],
    publishedAt: r.published_at,
    startsAt: null,
    location: r.location,
    isLive: false,
  }))
}

/** `events` es el cliente de la base externa de eventosagropy.com (solo lectura). */
export async function loadEventCandidates(events: SupabaseClient | null, asOf: Date): Promise<FeedCandidate[]> {
  if (!events) return []
  const today = asOf.toISOString().split('T')[0]
  const { data, error } = await events
    .from('events')
    .select('id,slug,title,description,category,date,time,location,city,department,image_url,organization_id,created_at')
    .eq('is_approved', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(EVENTS_LIMIT)

  if (error) {
    console.error('feed: eventos externos falló:', error.message)
    return []
  }

  const rows = data as EventRow[]
  const orgIds = [...new Set(rows.map((r) => r.organization_id).filter((id): id is string => !!id))]
  const orgs = new Map<string, EventOrgRow>()
  if (orgIds.length > 0) {
    const { data: orgData } = await events.from('organizations').select('*').in('id', orgIds)
    for (const o of (orgData ?? []) as EventOrgRow[]) orgs.set(o.id, o)
  }

  return rows.map((r) => {
    const org = r.organization_id ? orgs.get(r.organization_id) : undefined
    const department = toSlug(r.department)
    return {
      key: `event:${r.slug}`,
      source: 'event' as const,
      sourceId: r.slug,
      contentType: 'evento' as const,
      // Prefijo para que un id de la base externa nunca coincida con una organización nuestra.
      organizationId: r.organization_id ? `ext:${r.organization_id}` : null,
      organizationName: org?.name ?? EVENTS_FALLBACK_ORG,
      organizationLogoUrl: org?.logo_url ?? null,
      title: r.title,
      summary: r.description ?? '',
      mediaUrl: r.image_url,
      mediaKind: r.image_url ? ('image' as const) : ('none' as const),
      youtubeUrl: null,
      tags: [toSlug(r.category)].filter((t): t is string => t !== null),
      targetDepartments: department ? [department] : [],
      publishedAt: r.created_at,
      startsAt: eventStartIso(r.date, r.time),
      location: [r.location, r.city].filter(Boolean).join(', ') || null,
      isLive: false,
    }
  })
}
