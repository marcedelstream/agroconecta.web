// Contrato del feed v2 (docs/design_handoff_v2_feed). La app mobile tiene su copia espejo de
// FeedItem/FeedContentType — si cambia algo acá, cambiarlo también en mobile/lib/feed-v2/types.ts.

export type FeedSource = 'post' | 'event' | 'listing' | 'library'

// encuesta, quiz y patrocinado se suman en las Fases 2 y 4.
export type FeedContentType =
  | 'noticia'
  | 'video'
  | 'evento'
  | 'curso'
  | 'producto'
  | 'servicio'
  | 'empleo'
  | 'remate'
  | 'libro'

export type FeedMediaKind = 'image' | 'youtube' | 'none'

/** Un contenido candidato, ya normalizado desde su tabla de origen. */
export interface FeedCandidate {
  key: string
  source: FeedSource
  sourceId: string
  /** Dirección legible armada con el título (todas las fuentes, fix-v2-slugs.sql). Los links públicos usan esto, nunca el id. */
  slug: string | null
  contentType: FeedContentType
  organizationId: string | null
  organizationName: string
  organizationLogoUrl: string | null
  title: string
  summary: string
  mediaUrl: string | null
  mediaKind: FeedMediaKind
  youtubeUrl: string | null
  /** Rubros/categorías en slug (ganaderia, agricultura, mercados…). */
  tags: string[]
  /** Departamentos en slug; vacío = alcance nacional. */
  targetDepartments: string[]
  publishedAt: string
  startsAt: string | null
  location: string | null
  isLive: boolean
}

export interface FeedEngagement {
  impressions: number
  likes: number
  saves: number
  ctaOpens: number
}

export type SeenState = 'seen' | 'skipped'

export interface FeedUserSignals {
  department: string | null
  profession: string | null
  interests: string[]
  followedOrgIds: Set<string>
  seen: Map<string, SeenState>
}

export interface FeedWeights {
  w_rec: number
  w_int: number
  w_geo: number
  w_prof: number
  w_fol: number
  w_eng: number
  w_evt: number
  w_seen: number
  exploration: number
}

export interface FeedContentItem extends FeedCandidate {
  kind: 'content'
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
  /** Solo viaja para preguntas ya respondidas. */
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

export type FeedInteractiveItem = FeedPollItem | FeedQuizItem

export interface FeedSponsoredItem {
  kind: 'sponsored'
  key: string
  campaignId: string
  advertiserName: string
  title: string
  body: string
  imageUrl: string
  /** Texto del botón que cargó el anunciante (máx. 18); si no hay, la app usa "Ver promoción". */
  ctaLabel: string | null
  linkType: string | null
  linkTarget: string | null
}

export type FeedItem = FeedContentItem | FeedMarketItem | FeedInteractiveItem | FeedSponsoredItem

export interface FeedPage {
  items: FeedItem[]
  nextCursor: string | null
}
