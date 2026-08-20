import { supabase } from './supabase'
import { supabaseEvents } from './supabase-events'
import type {
  AdCampaign,
  AdPlacement,
  AgroEvent,
  AllyCategory,
  AllyPlan,
  AuctionStatus,
  CommercialStatus,
  ContentType,
  Department,
  EcosystemListing,
  EcosystemListingKind,
  EditorialStatus,
  EventMedia,
  EventScheduleItem,
  LibraryCategory,
  LibraryItem,
  MarketPrice,
  MarketPriceKind,
  NewsCategory,
  Organization,
  OrganizationType,
  Post,
  UserLibraryEntry,
} from './types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const POST_SELECT = '*, organizations(name, logo_url, slug)'

interface RelatedOrganizationRow {
  name: string | null
  logo_url: string | null
  slug: string | null
}

type MaybeArray<T> = T | T[] | null

interface PostRow {
  id: string
  slug?: string | null
  title: string
  summary: string
  content: string | null
  category: NewsCategory
  content_type?: ContentType | null
  editorial_status?: EditorialStatus | null
  is_important?: boolean | null
  is_highlighted?: boolean | null
  image_url: string | null
  organization_id?: string | null
  target_departments?: Department[] | null
  published_at?: string | null
  created_at: string
  youtube_url?: string | null
  auction_status?: AuctionStatus | null
  starts_at?: string | null
  event_tag?: string | null
  organizations?: MaybeArray<RelatedOrganizationRow>
}

interface OrganizationRow {
  id: string
  slug: string
  name: string
  description: string
  type: OrganizationType
  is_verified: boolean
  commercial_status: CommercialStatus
  plan_name: string
  plan_started_at?: string | null
  billing_notes?: string | null
  logo_url?: string | null
  events_organizer_slug?: string | null
  ally_plan?: AllyPlan | null
  ally_category?: AllyCategory | null
  ally_founder?: boolean | null
  contact_phone?: string | null
}

interface AgroEventRow {
  id: string
  title: string
  description?: string | null
  long_description?: string | null
  category?: string | null
  date: string
  end_date?: string | null
  time?: string | null
  location?: string | null
  city?: string | null
  department?: string | null
  image_url?: string | null
  internal_banner_url?: string | null
  slug: string
  is_premium?: boolean | null
  speakers?: string[] | null
  important_links?: { label: string; url: string }[] | null
  maps_url?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  organization_id?: string | null
  created_at: string
}

interface AdCampaignRow {
  id: string
  title: string
  image_url: string
  placement?: AdPlacement[] | null
  target_professions?: AdCampaign['targetProfessions'] | null
  target_departments?: Department[] | null
  target_categories?: NewsCategory[] | null
  starts_at?: string | null
  ends_at?: string | null
  created_at: string
  is_active: boolean
  link_type?: AdCampaign['linkType'] | null
  link_target?: string | null
}

interface LibraryItemRow {
  id: string
  title: string
  author?: string | null
  description: string
  category: LibraryCategory
  cover_image_url: string
  file_url: string
  file_type: string
  page_count?: number | null
  created_at: string
}

// Fila de la futura tabla `ecosystem_listings` (empleo/clasificado/curso, boceto 4f) —
// todavía no existe en Supabase, se carga desde el admin cuando esté lista.
interface EcosystemListingRow {
  id: string
  slug?: string | null
  kind: EcosystemListingKind
  title: string
  location: string
  modality: string
  description: string
  image_url?: string | null
  category_label: string
  publisher_name: string
  published_at: string
  contact_url?: string | null
  is_free?: boolean | null
}

interface UserLibraryRow {
  item_id: string
  added_at: string
  last_opened_at?: string | null
  progress_percent?: number | string | null
}

interface EventScheduleItemRow {
  id: string
  event_slug: string
  day_label?: string | null
  time?: string | null
  title: string
  description?: string | null
  speaker?: string | null
  order_index: number
}

interface EventMediaRow {
  event_slug: string
  profile_image_url?: string | null
  banner_image_url?: string | null
  is_active?: boolean | null
}

interface MarketPriceRow {
  id: string
  kind: MarketPriceKind
  label: string
  market: string
  currency: MarketPrice['currency']
  unit: string
  value: number | string
  change: number | string
  change_percent: number | string
  updated_at: string
}

function firstRelation<T>(relation: MaybeArray<T> | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null
  return relation ?? null
}

function mapPost(row: PostRow): Post {
  const org = firstRelation(row.organizations)
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    title: row.title,
    summary: row.summary,
    content: row.content ?? '',
    category: row.category,
    contentType: row.content_type ?? undefined,
    editorialStatus: row.editorial_status ?? undefined,
    isImportant: row.is_important ?? undefined,
    isHighlighted: row.is_highlighted ?? undefined,
    imageUrl: row.image_url ?? '',
    source: org?.name ?? 'Agroconecta',
    organizationId: row.organization_id ?? undefined,
    organizationLogoUrl: org?.logo_url ?? undefined,
    organizationSlug: org?.slug ?? undefined,
    publisherId: row.organization_id ?? undefined,
    targetDepartments: row.target_departments ?? [],
    publishedAt: new Date(row.published_at ?? row.created_at),
    readTime: Math.max(2, Math.ceil(String(row.content ?? '').length / 900)),
    youtubeUrl: row.youtube_url ?? undefined,
    auctionStatus: row.auction_status ?? undefined,
    startsAt: row.starts_at ? new Date(row.starts_at) : undefined,
    eventTag: row.event_tag ?? undefined,
  }
}

export async function fetchPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('editorial_status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapPost(row as PostRow))
}

export async function fetchPostsByOrganization(orgId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('editorial_status', 'published')
    .eq('organization_id', orgId)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapPost(row as PostRow))
}

// Videos/remates marcados "en vivo" ahora mismo, para el botón EN VIVO del header.
export async function fetchLiveVideos(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .in('content_type', ['video', 'auction'])
    .eq('auction_status', 'live')
    .eq('editorial_status', 'published')

  if (error) throw error
  return (data ?? []).map((row) => mapPost(row as PostRow))
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
  return mapPost(data as PostRow)
}

function mapOrganization(row: OrganizationRow): Organization {
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
    billingNotes: row.billing_notes ?? undefined,
    logoUrl: row.logo_url ?? undefined,
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
  return (data ?? []).map((row) => mapOrganization(row as OrganizationRow))
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
  return (data ?? []).map((row) => mapOrganization(row as OrganizationRow))
}

export async function fetchOrganizationById(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapOrganization(data as OrganizationRow)
}

function mapEvent(row: AgroEventRow): AgroEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    longDescription: row.long_description ?? undefined,
    category: row.category ?? '',
    date: row.date,
    endDate: row.end_date ?? undefined,
    time: row.time ?? undefined,
    location: row.location ?? '',
    city: row.city ?? undefined,
    department: row.department ?? undefined,
    imageUrl: row.image_url ?? undefined,
    internalBannerUrl: row.internal_banner_url ?? undefined,
    slug: row.slug,
    isPremium: row.is_premium ?? false,
    speakers: row.speakers ?? undefined,
    importantLinks: row.important_links ?? undefined,
    mapsUrl: row.maps_url ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    organizationId: row.organization_id ?? undefined,
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
  return (data ?? []).map((row) => mapEvent(row as AgroEventRow))
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
  return (data ?? []).map((row) => mapEvent(row as AgroEventRow))
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
  return mapEvent(data as AgroEventRow)
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
  return (data ?? []).map((row) => mapEvent(row as AgroEventRow))
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
  return (data ?? []).map((row) => {
    const typed = row as AdCampaignRow
    return {
      id: typed.id,
      title: typed.title,
      imageUrl: typed.image_url,
      placement: typed.placement ?? ['home'],
      targetProfessions: typed.target_professions ?? [],
      targetDepartments: typed.target_departments ?? [],
      targetCategories: typed.target_categories ?? [],
      startsAt: new Date(typed.starts_at ?? typed.created_at),
      endsAt: typed.ends_at ? new Date(typed.ends_at) : undefined,
      isActive: typed.is_active,
      linkType: typed.link_type ?? undefined,
      linkTarget: typed.link_target ?? undefined,
    }
  })
}

function mapLibraryItem(row: LibraryItemRow): LibraryItem {
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? undefined,
    description: row.description,
    category: row.category,
    coverImageUrl: row.cover_image_url,
    fileUrl: row.file_url,
    fileType: row.file_type,
    pageCount: row.page_count ?? undefined,
    createdAt: new Date(row.created_at),
  }
}

export async function fetchLibraryItems(): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapLibraryItem(row as LibraryItemRow))
}

export async function fetchLibraryItemById(id: string): Promise<LibraryItem | null> {
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapLibraryItem(data as LibraryItemRow)
}

export async function fetchUserLibrary(userId: string): Promise<UserLibraryEntry[]> {
  const { data, error } = await supabase
    .from('user_library')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return (data ?? []).map((row) => {
    const typed = row as UserLibraryRow
    return {
      itemId: typed.item_id,
      addedAt: new Date(typed.added_at),
      lastOpenedAt: typed.last_opened_at ? new Date(typed.last_opened_at) : undefined,
      progressPercent: Number(typed.progress_percent ?? 0),
    }
  })
}

export async function addToUserLibrary(userId: string, itemId: string): Promise<void> {
  await supabase.from('user_library').upsert(
    { user_id: userId, item_id: itemId },
    { onConflict: 'user_id,item_id' }
  )
}

export async function removeFromUserLibrary(userId: string, itemId: string): Promise<void> {
  await supabase.from('user_library').delete().eq('user_id', userId).eq('item_id', itemId)
}

export async function markLibraryItemOpened(userId: string, itemId: string): Promise<void> {
  await supabase.from('user_library').update({ last_opened_at: new Date().toISOString() })
    .eq('user_id', userId).eq('item_id', itemId)
}

// El bucket de archivos es privado — se pide una URL firmada (10 min) recién al abrir el lector.
export async function fetchLibraryFileSignedUrl(path: string): Promise<string | null> {
  // Permite cargar un item de biblioteca apuntando a una URL externa (seed/demo) sin pasar
  // por el bucket privado — los uploads reales desde el admin guardan un path, no una URL.
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const { data, error } = await supabase.storage.from('library-files').createSignedUrl(path, 600)
  if (error) return null
  return data?.signedUrl ?? null
}

export async function fetchEventSchedule(eventSlug: string): Promise<EventScheduleItem[]> {
  const { data, error } = await supabase
    .from('event_schedule_items')
    .select('*')
    .eq('event_slug', eventSlug)
    .order('order_index', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => {
    const typed = row as EventScheduleItemRow
    return {
      id: typed.id,
      eventSlug: typed.event_slug,
      dayLabel: typed.day_label ?? undefined,
      time: typed.time ?? undefined,
      title: typed.title,
      description: typed.description ?? undefined,
      speaker: typed.speaker ?? undefined,
      orderIndex: typed.order_index,
    }
  })
}

export async function fetchEventMedia(eventSlug: string): Promise<EventMedia | null> {
  const { data, error } = await supabase
    .from('event_media')
    .select('*')
    .eq('event_slug', eventSlug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const typed = data as EventMediaRow
  return {
    eventSlug: typed.event_slug,
    profileImageUrl: typed.profile_image_url ?? undefined,
    bannerImageUrl: typed.banner_image_url ?? undefined,
    isActive: typed.is_active ?? false,
  }
}

// Evento único destacado en el Home (banner estilo OneFootball) — el admin lo activa/desactiva
// desde /admin/eventos, útil para preparar y probar un evento antes de mostrarlo públicamente.
export async function fetchFeaturedEventMedia(): Promise<EventMedia | null> {
  const { data, error } = await supabase
    .from('event_media')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const typed = data as EventMediaRow
  return {
    eventSlug: typed.event_slug,
    profileImageUrl: typed.profile_image_url ?? undefined,
    bannerImageUrl: typed.banner_image_url ?? undefined,
    isActive: typed.is_active ?? false,
  }
}

export async function fetchPostsByEventTag(eventSlug: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('editorial_status', 'published')
    .eq('event_tag', eventSlug)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapPost(row as PostRow))
}

export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => {
    const typed = row as MarketPriceRow
    return {
      id: typed.id,
      kind: typed.kind,
      label: typed.label,
      market: typed.market,
      currency: typed.currency,
      unit: typed.unit,
      value: Number(typed.value),
      change: Number(typed.change),
      changePercent: Number(typed.change_percent),
      updatedAt: new Date(typed.updated_at),
    }
  })
}

function mapEcosystemListing(row: EcosystemListingRow): EcosystemListing {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    kind: row.kind,
    title: row.title,
    location: row.location,
    modality: row.modality,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    categoryLabel: row.category_label,
    publisherName: row.publisher_name,
    publishedAt: new Date(row.published_at),
    contactUrl: row.contact_url ?? undefined,
    isFree: row.is_free ?? false,
  }
}

// La tabla `ecosystem_listings` todavía no existe en Supabase — estas funciones tiran
// error hasta que el admin la cree y empiece a cargar publicaciones (ver EcosystemListing
// en lib/types.ts). Las pantallas que las llaman ya hacen fallback a mockEcosystemListings.
export async function fetchEcosystemListings(kind?: EcosystemListingKind): Promise<EcosystemListing[]> {
  let query = supabase.from('ecosystem_listings').select('*').order('published_at', { ascending: false })
  if (kind) query = query.eq('kind', kind)
  const { data, error } = await query

  if (error) throw error
  return (data ?? []).map((row) => mapEcosystemListing(row as EcosystemListingRow))
}

export async function fetchEcosystemListingById(id: string): Promise<EcosystemListing | null> {
  const { data, error } = await supabase
    .from('ecosystem_listings')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapEcosystemListing(data as EcosystemListingRow) : null
}
