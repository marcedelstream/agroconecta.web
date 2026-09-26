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

export interface FeedPollItem {
  kind: 'poll'
  key: string
  id: string
  question: string
  points: number
  options: { id: string; label: string }[]
}

export interface QuizAnswer {
  questionId: string
  chosenIndex: number
  correct: boolean
  correctIndex: number
}

export interface FeedQuizItem {
  kind: 'quiz'
  key: string
  id: string
  title: string
  pointsPerCorrect: number
  questions: { id: string; question: string; options: string[] }[]
  answered: QuizAnswer[]
}

export interface FeedSponsoredItem {
  kind: 'sponsored'
  key: string
  campaignId: string
  advertiserName: string
  title: string
  body: string
  imageUrl: string
  ctaLabel: string | null
  linkType: string | null
  linkTarget: string | null
}

/** Primera tarjeta del feed para quien no inició sesión: invita a entrar y a sumar los puntos de bienvenida. */
export interface FeedWelcomeItem {
  kind: 'welcome'
  key: 'welcome'
}

export type FeedItem = FeedContentItem | FeedMarketItem | FeedPollItem | FeedQuizItem | FeedSponsoredItem | FeedWelcomeItem

export interface LiveItem {
  key: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  streamUrl: string
  source: FeedSource | null
  sourceId: string | null
  dismissed: boolean
}

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
