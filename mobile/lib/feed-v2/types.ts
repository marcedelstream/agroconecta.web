// Espejo del contrato de web/lib/feed/types.ts (lo que devuelve GET /api/feed). Si cambia allá,
// cambiarlo acá.

export type FeedSource = 'post' | 'event' | 'listing'

export type FeedContentType =
  | 'noticia'
  | 'video'
  | 'evento'
  | 'curso'
  | 'producto'
  | 'servicio'
  | 'empleo'
  | 'remate'

export type FeedMediaKind = 'image' | 'youtube' | 'none'

export interface FeedContentItem {
  kind: 'content'
  key: string
  source: FeedSource
  sourceId: string
  contentType: FeedContentType
  organizationId: string | null
  organizationName: string
  organizationLogoUrl: string | null
  title: string
  summary: string
  mediaUrl: string | null
  mediaKind: FeedMediaKind
  youtubeUrl: string | null
  tags: string[]
  targetDepartments: string[]
  publishedAt: string
  startsAt: string | null
  location: string | null
  isLive: boolean
  likes: number
  saves: number
  liked: boolean
  saved: boolean
  following: boolean
}

export interface FeedMarketItem {
  kind: 'market'
  key: 'market'
}

export type FeedItem = FeedContentItem | FeedMarketItem

export interface FeedPage {
  items: FeedItem[]
  nextCursor: string | null
}

export interface TrendingTag {
  tag: string
  count: number
}

export interface ExplorePage {
  items: FeedContentItem[]
  trending: TrendingTag[]
}

export interface ExploreFilters {
  query: string
  type: FeedContentType | null
  rubro: string | null
}

export type ActivityKind = 'viewed' | 'events' | 'products'

export interface ActivitySummary {
  kind: ActivityKind
  count: number
  recent: string[]
}

export interface ReminderEntry {
  item: FeedContentItem
  remindAt: string
  enabled: boolean
}

export interface GuardadosPage {
  saved: FeedContentItem[]
  reminders: ReminderEntry[]
  activity: ActivitySummary[]
}

export type FeedEventType =
  | 'impression'
  | 'dwell'
  | 'skip_fast'
  | 'like'
  | 'save'
  | 'share'
  | 'cta_open'
  | 'follow'
  | 'video_complete'
