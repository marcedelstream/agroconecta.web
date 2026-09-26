import type { SupabaseClient } from '@supabase/supabase-js'
import { eventStartIso, toSlug, youtubeThumbnail } from './normalize'
import type { FeedCandidate, FeedContentType } from './types'

// Filas de cada fuente y su conversión a FeedCandidate. Lo comparten la carga del feed (por ventana
// de fechas, candidates.ts) y la carga por id de Guardados (by-key.ts).

const EVENTS_FALLBACK_ORG = 'Eventos Agro'

export const POST_COLUMNS =
  'id,organization_id,title,summary,category,target_departments,content_type,image_url,youtube_url,auction_status,starts_at,published_at,organizations(name,logo_url)'
export const LISTING_COLUMNS = 'id,kind,title,description,image_url,category_label,publisher_name,location,published_at'
export const EVENT_COLUMNS = 'id,slug,title,description,category,date,time,location,city,department,image_url,organization_id,created_at'

export interface PostRow {
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

export interface ListingRow {
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

export interface EventRow {
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

export interface EventOrgRow {
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

export function mapPostRow(r: PostRow, fallbackIso: string): FeedCandidate {
  const thumb = r.image_url ?? youtubeThumbnail(r.youtube_url)
  return {
    key: `post:${r.id}`,
    source: 'post',
    sourceId: r.id,
    contentType: POST_TYPE[r.content_type],
    organizationId: r.organization_id,
    organizationName: r.organizations?.name ?? '',
    organizationLogoUrl: r.organizations?.logo_url ?? null,
    title: r.title,
    summary: r.summary,
    mediaUrl: thumb,
    mediaKind: r.youtube_url ? 'youtube' : thumb ? 'image' : 'none',
    youtubeUrl: r.youtube_url,
    tags: [r.category],
    targetDepartments: r.target_departments ?? [],
    publishedAt: r.published_at ?? fallbackIso,
    startsAt: r.starts_at,
    location: null,
    isLive: r.auction_status === 'live',
  }
}

export function mapListingRow(r: ListingRow): FeedCandidate {
  return {
    key: `listing:${r.id}`,
    source: 'listing',
    sourceId: r.id,
    contentType: LISTING_TYPE[r.kind],
    // Los listings no tienen organización propia: se agrupan por publicador para la regla de mezcla.
    organizationId: null,
    organizationName: r.publisher_name,
    organizationLogoUrl: null,
    title: r.title,
    summary: r.description,
    mediaUrl: r.image_url,
    mediaKind: r.image_url ? 'image' : 'none',
    youtubeUrl: null,
    tags: [toSlug(r.category_label)].filter((t): t is string => t !== null),
    targetDepartments: [],
    publishedAt: r.published_at,
    startsAt: null,
    location: r.location,
    isLive: false,
  }
}

/** Convierte eventos de la base externa, trayendo sus organizaciones en una sola consulta. */
export async function mapEventRows(events: SupabaseClient, rows: EventRow[]): Promise<FeedCandidate[]> {
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
      source: 'event',
      sourceId: r.slug,
      contentType: 'evento',
      // Prefijo para que un id de la base externa nunca coincida con una organización nuestra.
      organizationId: r.organization_id ? `ext:${r.organization_id}` : null,
      organizationName: org?.name ?? EVENTS_FALLBACK_ORG,
      organizationLogoUrl: org?.logo_url ?? null,
      title: r.title,
      summary: r.description ?? '',
      mediaUrl: r.image_url,
      mediaKind: r.image_url ? 'image' : 'none',
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
