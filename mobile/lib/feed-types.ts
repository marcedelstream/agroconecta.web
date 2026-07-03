import type { NewsArticle, AdSegment } from './types'

export type FeedItem =
  | { kind: 'article'; data: NewsArticle }
  | { kind: 'section-header'; title: string; subtitle?: string }
  | { kind: 'ad'; segment?: AdSegment }
