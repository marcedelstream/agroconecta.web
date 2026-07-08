export type NewsCategory =
  | 'ganaderia'
  | 'agricultura'
  | 'clima'
  | 'mercados'
  | 'tecnologia'
  | 'institucional'

export type Department =
  | 'asuncion'
  | 'central'
  | 'alto-parana'
  | 'itapua'
  | 'caaguazu'
  | 'san-pedro'
  | 'canindeyu'
  | 'paraguari'
  | 'cordillera'
  | 'guaira'
  | 'caazapa'
  | 'misiones'
  | 'neembucu'
  | 'amambay'
  | 'concepcion'
  | 'presidente-hayes'
  | 'boqueron'
  | 'alto-paraguay'

export type EditorialStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'archived'

export type ContentType =
  | 'article'
  | 'video'
  | 'auction'
  | 'institutional_notice'

export type MarketPriceKind = 'cattle' | 'international'

export type OrganizationType =
  | 'media'
  | 'asociacion'
  | 'institucion'
  | 'gremio'
  | 'rematadora'
  | 'empresa'

export type CommercialStatus = 'trial' | 'active' | 'overdue' | 'paused'

export interface PostRow {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: NewsCategory
  target_departments?: Department[] | null
  content_type: ContentType
  editorial_status: EditorialStatus
  image_url: string | null
  youtube_url: string | null
  is_important: boolean
  is_highlighted: boolean
  published_at: string | null
  created_at: string
  organization_id?: string | null
  organizations?: { name: string; logo_url: string | null; slug: string; is_verified: boolean } | null
  event_tag?: string | null
}

export type AdLinkType = 'event' | 'post' | 'url' | 'course'

export const LINK_TYPE_LABELS: Record<AdLinkType, string> = {
  event: 'Evento (por slug)',
  post: 'Publicación (por id)',
  url: 'URL externa',
  course: 'Curso (por id)',
}

export type AdPlacement = 'home' | 'article' | 'precios' | 'videos'

export const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  home: 'Inicio',
  article: 'Noticia',
  precios: 'Precios',
  videos: 'Videos',
}

export interface AdCampaignRow {
  id: string
  title: string
  image_url: string
  placement: AdPlacement[]
  target_professions: string[]
  target_departments: Department[]
  target_categories: NewsCategory[]
  starts_at: string
  ends_at: string | null
  is_active: boolean
  link_type: AdLinkType | null
  link_target: string | null
}

export interface EventScheduleItemRow {
  id: string
  event_slug: string
  day_label: string | null
  time: string | null
  title: string
  description: string | null
  speaker: string | null
  order_index: number
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: 'Artículo',
  video: 'Video',
  auction: 'Remate',
  institutional_notice: 'Aviso institucional',
}

export interface MarketPriceRow {
  id: string
  kind: MarketPriceKind
  label: string
  market: string
  currency: 'PYG' | 'USD'
  unit: string
  value: number
  change: number
  change_percent: number
  updated_at: string
}

export interface OrganizationRow {
  id: string
  slug: string
  name: string
  description: string
  type: OrganizationType
  commercial_status: CommercialStatus
  plan_name: string
  is_verified: boolean
  logo_url: string | null
  events_organizer_slug?: string | null
}

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  ganaderia: 'Ganadería',
  agricultura: 'Agricultura',
  clima: 'Clima',
  mercados: 'Mercados',
  tecnologia: 'Tecnología',
  institucional: 'Institucional',
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  asuncion: 'Asunción',
  central: 'Central',
  'alto-parana': 'Alto Paraná',
  itapua: 'Itapúa',
  caaguazu: 'Caaguazú',
  'san-pedro': 'San Pedro',
  canindeyu: 'Canindeyú',
  paraguari: 'Paraguarí',
  cordillera: 'Cordillera',
  guaira: 'Guairá',
  caazapa: 'Caazapá',
  misiones: 'Misiones',
  neembucu: 'Ñeembucú',
  amambay: 'Amambay',
  concepcion: 'Concepción',
  'presidente-hayes': 'Presidente Hayes',
  boqueron: 'Boquerón',
  'alto-paraguay': 'Alto Paraguay',
}

export const CATEGORY_COLORS: Record<NewsCategory, string> = {
  ganaderia: '#A4D233',
  agricultura: '#22C55E',
  clima: '#3B82F6',
  mercados: '#F59E0B',
  tecnologia: '#8B5CF6',
  institucional: '#6B7280',
}

export const STATUS_LABELS: Record<EditorialStatus, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  published: 'Publicado',
  rejected: 'Rechazado',
  archived: 'Archivado',
}

export const STATUS_COLORS: Record<EditorialStatus, string> = {
  draft: '#6B7280',
  pending_review: '#F59E0B',
  published: '#22C55E',
  rejected: '#FF4D4D',
  archived: '#8B8B9A',
}
