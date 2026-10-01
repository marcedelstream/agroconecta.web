import { describe, expect, it } from 'vitest'
import { summarizeActivity } from './guardados'
import type { FeedCandidate, FeedContentType } from './types'

function cand(key: string, contentType: FeedContentType, title: string): FeedCandidate {
  const [source, sourceId] = key.split(':') as [FeedCandidate['source'], string]
  return {
    key,
    source,
    sourceId,
    slug: null,
    contentType,
    organizationId: null,
    organizationName: '',
    organizationLogoUrl: null,
    title,
    summary: '',
    mediaUrl: null,
    mediaKind: 'none',
    youtubeUrl: null,
    tags: [],
    targetDepartments: [],
    publishedAt: '2026-09-01T00:00:00Z',
    startsAt: null,
    location: null,
    isLive: false,
  }
}

const ev = (key: string, event_type: string) => {
  const [source, source_id] = key.split(':')
  return { source, source_id, event_type }
}

describe('summarizeActivity', () => {
  const items = new Map([
    ['post:n1', cand('post:n1', 'noticia', 'Nota 1')],
    ['listing:p1', cand('listing:p1', 'producto', 'Tractor usado')],
    ['event:expo', cand('event:expo', 'evento', 'Expo Pioneros')],
  ])

  it('cuenta vistos sin repetir y en orden del más reciente', () => {
    const rows = [ev('post:n1', 'impression'), ev('listing:p1', 'dwell'), ev('post:n1', 'impression')]
    const viewed = summarizeActivity(rows, items).find((a) => a.kind === 'viewed')
    expect(viewed).toEqual({ kind: 'viewed', count: 2, recent: ['Nota 1', 'Tractor usado'] })
  })

  it('eventos visitados y productos consultados salen de lo abierto con "Ver …"', () => {
    const rows = [ev('event:expo', 'cta_open'), ev('listing:p1', 'cta_open'), ev('post:n1', 'cta_open'), ev('listing:p1', 'impression')]
    const byKind = Object.fromEntries(summarizeActivity(rows, items).map((a) => [a.kind, a]))
    expect(byKind.events).toEqual({ kind: 'events', count: 1, recent: ['Expo Pioneros'] })
    expect(byKind.products).toEqual({ kind: 'products', count: 1, recent: ['Tractor usado'] })
  })
})
