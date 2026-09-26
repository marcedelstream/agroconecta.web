import { describe, expect, it } from 'vitest'
import { filterCandidates, matchesQuery, trendingTags } from './explore'
import type { FeedCandidate } from './types'

const NOW = new Date('2026-09-25T12:00:00Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString()

let seq = 0
function cand(over: Partial<FeedCandidate> = {}): FeedCandidate {
  seq += 1
  return {
    key: `post:x${seq}`,
    source: 'post',
    sourceId: `x${seq}`,
    contentType: 'noticia',
    organizationId: null,
    organizationName: 'Org',
    organizationLogoUrl: null,
    title: 'Título',
    summary: '',
    mediaUrl: null,
    mediaKind: 'none',
    youtubeUrl: null,
    tags: [],
    targetDepartments: [],
    publishedAt: daysAgo(1),
    startsAt: null,
    location: null,
    isLive: false,
    ...over,
  }
}

describe('Explorar', () => {
  it('busca sin importar tildes ni mayúsculas, y exige todas las palabras', () => {
    const c = cand({ title: 'Remate de invernada en Concepción', organizationName: 'Rematadora Norte' })
    expect(matchesQuery(c, 'concepcion')).toBe(true)
    expect(matchesQuery(c, 'REMATE norte')).toBe(true)
    expect(matchesQuery(c, 'remate soja')).toBe(false)
    expect(matchesQuery(c, '')).toBe(true)
  })

  it('filtra por tipo y por rubro a la vez', () => {
    const a = cand({ contentType: 'curso', tags: ['ganaderia'] })
    const b = cand({ contentType: 'curso', tags: ['agricultura'] })
    const c = cand({ contentType: 'noticia', tags: ['ganaderia'] })
    expect(filterCandidates([a, b, c], { query: '', type: 'curso', rubro: 'ganaderia' })).toEqual([a])
    expect(filterCandidates([a, b, c], { query: '', type: null, rubro: 'ganaderia' })).toEqual([a, c])
  })

  it('tendencias: las 4 etiquetas más usadas en las últimas 2 semanas', () => {
    const items = [
      ...Array.from({ length: 3 }, () => cand({ tags: ['soja'] })),
      ...Array.from({ length: 2 }, () => cand({ tags: ['ganaderia'] })),
      cand({ tags: ['clima'] }),
      cand({ tags: ['mercados'] }),
      cand({ tags: ['tecnologia'] }),
      ...Array.from({ length: 9 }, () => cand({ tags: ['viejo'], publishedAt: daysAgo(30) })),
    ]
    expect(trendingTags(items, NOW).map((t) => t.tag)).toEqual(['soja', 'ganaderia', 'clima', 'mercados'])
    expect(trendingTags(items, NOW)[0]).toEqual({ tag: 'soja', count: 3 })
  })
})
