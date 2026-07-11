import { supabase } from './supabase'
import { supabaseEvents } from './supabase-events'
import type { AdCampaign, AdPlacement, AgroEvent, EventScheduleItem, MarketPrice, Organization, Post } from './types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const POST_SELECT = '*, organizations(name, logo_url, slug)'

function mapPost(row: any): Post {
  const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    contentType: row.content_type,
    editorialStatus: row.editorial_status,
    isImportant: row.is_important,
    isHighlighted: row.is_highlighted,
    imageUrl: row.image_url,
    source: org?.name ?? 'Agroconecta',
    organizationId: row.organization_id,
    organizationLogoUrl: org?.logo_url ?? undefined,
    organizationSlug: org?.slug ?? undefined,
    publisherId: row.organization_id,
    targetDepartments: row.target_departments ?? [],
    publishedAt: new Date(row.published_at ?? row.created_at),
    readTime: Math.max(2, Math.ceil(String(row.content ?? '').length / 900)),
    youtubeUrl: row.youtube_url,
    auctionStatus: row.auction_status,
    startsAt: row.starts_at ? new Date(row.starts_at) : undefined,
  }
}

export async function fetchPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('editorial_status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapPost)
}

export async function fetchPostsByOrganization(orgId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('editorial_status', 'published')
    .eq('organization_id', orgId)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapPost)
}

// Acepta tanto el slug legible como el uuid crudo (deep links de push notifications
// siguen mandando el uuid) y busca por la columna que corresponda.
export async function fetchPublishedPostBySlug(slugOrId: string): Promise<Post | null> {
  const column = UUID_PATTERN.test(slugOrId) ? 'id' : 'slug'
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq(column, slugOrId)
    .eq('editorial_status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapPost(data as any)
}

function mapOrganization(row: any): Organization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.type,
    isVerified: row.is_verified,
    commercialStatus: row.commercial_status,
    planName: row.plan_name,
    planStartedAt: row.plan_started_at ? new Date(row.plan_started_at) : undefined,
    billingNotes: row.billing_notes,
    logoUrl: row.logo_url,
    eventsOrganizerSlug: row.events_organizer_slug ?? undefined,
    allyPlan: row.ally_plan ?? undefined,
    allyCategory: row.ally_category ?? undefined,
    allyFounder: row.ally_founder ?? false,
    contactPhone: row.contact_phone ?? undefined,
  }
}

// Solo organizaciones con al menos una publicación publicada — evita listar cuentas
// que todavía no cargaron ninguna nota.
export async function fetchOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*, posts!inner(id)')
    .eq('posts.editorial_status', 'published')
    .order('name')

  if (error) throw error
  return (data ?? []).map(mapOrganization)
}

// Directorio de Aliados: organizaciones que pagan el fee anual, independiente de si
// publicaron alguna noticia o no — a diferencia de fetchOrganizations().
export async function fetchAllyDirectory(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .not('ally_plan', 'is', null)
    .eq('commercial_status', 'active')
    .order('name')

  if (error) throw error
  return (data ?? []).map(mapOrganization)
}

export async function fetchOrganizationById(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapOrganization(data)
}

function mapEvent(row: any): AgroEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    longDescription: row.long_description,
    category: row.category ?? '',
    date: row.date,
    endDate: row.end_date,
    time: row.time,
    location: row.location ?? '',
    city: row.city,
    department: row.department,
    imageUrl: row.image_url,
    internalBannerUrl: row.internal_banner_url,
    slug: row.slug,
    isPremium: row.is_premium ?? false,
    speakers: row.speakers,
    importantLinks: row.important_links,
    mapsUrl: row.maps_url,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    organizationId: row.organization_id,
    createdAt: row.created_at,
  }
}

export async function fetchUpcomingEvents(limit = 10): Promise<AgroEvent[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabaseEvents
    .from('events')
    .select('*')
    .eq('is_approved', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(mapEvent)
}

export async function fetchAllEvents(): Promise<AgroEvent[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabaseEvents
    .from('events')
    .select('*')
    .eq('is_approved', true)
    .gte('date', today)
    .order('date', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapEvent)
}

export async function fetchEventBySlug(slug: string): Promise<AgroEvent | null> {
  const { data, error } = await supabaseEvents
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_approved', true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapEvent(data)
}

export async function fetchEventsByOrganizerSlug(organizerSlug: string): Promise<AgroEvent[]> {
  const { data: org, error: orgError } = await supabaseEvents
    .from('organizations')
    .select('id')
    .eq('slug', organizerSlug)
    .maybeSingle()

  if (orgError || !org) return []

  const { data, error } = await supabaseEvents
    .from('events')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_approved', true)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapEvent)
}

export async function fetchSubscriptionNotify(userId: string, organizationId: string): Promise<boolean | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('notify')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (error || !data) return null
  return data.notify
}

export async function upsertSubscriptionNotify(userId: string, organizationId: string, notify: boolean): Promise<void> {
  await supabase.from('user_subscriptions').upsert(
    { user_id: userId, organization_id: organizationId, notify },
    { onConflict: 'user_id,organization_id' }
  )
}

export async function fetchActiveBanners(placement: AdPlacement = 'home'): Promise<AdCampaign[]> {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('is_active', true)
    .contains('placement', [placement])
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    placement: row.placement ?? ['home'],
    targetProfessions: row.target_professions ?? [],
    targetDepartments: row.target_departments ?? [],
    targetCategories: row.target_categories ?? [],
    startsAt: new Date(row.starts_at ?? row.created_at),
    endsAt: row.ends_at ? new Date(row.ends_at) : undefined,
    isActive: row.is_active,
    linkType: row.link_type ?? undefined,
    linkTarget: row.link_target ?? undefined,
  }))
}

export async function fetchEventSchedule(eventSlug: string): Promise<EventScheduleItem[]> {
  const { data, error } = await supabase
    .from('event_schedule_items')
    .select('*')
    .eq('event_slug', eventSlug)
    .order('order_index', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    eventSlug: row.event_slug,
    dayLabel: row.day_label ?? undefined,
    time: row.time ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    speaker: row.speaker ?? undefined,
    orderIndex: row.order_index,
  }))
}

export async function fetchPostsByEventTag(eventSlug: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('editorial_status', 'published')
    .eq('event_tag', eventSlug)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapPost)
}

export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    kind: row.kind,
    label: row.label,
    market: row.market,
    currency: row.currency,
    unit: row.unit,
    value: Number(row.value),
    change: Number(row.change),
    changePercent: Number(row.change_percent),
    updatedAt: new Date(row.updated_at),
  }))
}
