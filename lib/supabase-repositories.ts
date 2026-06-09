import { supabase } from './supabase'
import type { MarketPrice, Organization, Post } from './types'

export async function fetchPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, organizations(name)')
    .eq('editorial_status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row: any) => ({
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
  }))
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

  const row: any = data
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

export async function fetchOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name')

  if (error) throw error
  return (data ?? []).map((row: any) => ({
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
