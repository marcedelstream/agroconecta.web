import { supabase } from './supabase'
import { supabaseEvents } from './supabase-events'
import type { AdCampaign, AgroEvent, MarketPrice, Organization, Post } from './types'

function mapPost(row: any): Post {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    contentType: row.content_type,
    editorialStatus: row.editorial_status,
    isImportant: row.is_important,
    isHighlighted: row.is_highlighted,
    imageUrl: row.image_url,
    source: Array.isArray(row.organizations) ? row.organizations[0]?.name ?? 'Agroconecta' : row.organizations?.name ?? 'Agroconecta',
    organizationId: row.organization_id,
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
    .select('*, organizations(name)')
    .eq('editorial_status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapPost)
}

export async function fetchPostsByOrganization(orgId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, organizations(name)')
    .eq('editorial_status', 'published')
    .eq('organization_id', orgId)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapPost)
}

export async function fetchPublishedPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, organizations(name)')
    .eq('id', id)
    .eq('editorial_status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapPost(data as any)
}

function mapOrganization(row: any): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.type,
    isVerified: row.is_verified,
    commercialStatus: row.commercial_status,
    planName: row.plan_name,
    planStartedAt: row.plan_started_at ? new Date(row.plan_started_at) : undefined,
    billingNotes: row.billing_notes,
    logoUrl: row.logo_url,
  }
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
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

export async function fetchActiveBanners(): Promise<AdCampaign[]> {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    targetProfessions: row.target_professions ?? [],
    targetDepartments: row.target_departments ?? [],
    targetCategories: row.target_categories ?? [],
    startsAt: new Date(row.starts_at ?? row.created_at),
    endsAt: row.ends_at ? new Date(row.ends_at) : undefined,
    isActive: row.is_active,
  }))
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
