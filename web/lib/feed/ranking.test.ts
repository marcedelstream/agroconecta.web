import { describe, expect, it } from 'vitest'
import {
  chronologicalEvents,
  DEFAULT_WEIGHTS,
  deprioritizeSeen,
  engagementScore,
  eventProximityScore,
  geoMatch,
  rankFeed,
  recencyScore,
  scoreCandidate,
  spaceOut,
} from './ranking'
import type { FeedCandidate, FeedContentType, FeedUserSignals } from './types'

const NOW = new Date('2026-09-25T12:00:00Z')

function hoursAgo(h: number) {
  return new Date(NOW.getTime() - h * 3_600_000).toISOString()
}

let seq = 0
function cand(over: Partial<FeedCandidate> & { contentType?: FeedContentType } = {}): FeedCandidate {
  seq += 1
  const id = over.sourceId ?? `c${seq}`
  return {
    key: `post:${id}`,
    source: 'post',
    sourceId: id,
    contentType: 'noticia',
    organizationId: `org${seq}`,
    organizationName: 'Org',
    organizationLogoUrl: null,
    title: 't',
    summary: 's',
    mediaUrl: null,
    mediaKind: 'none',
    youtubeUrl: null,
    tags: [],
    targetDepartments: [],
    publishedAt: hoursAgo(1),
    startsAt: null,
    location: null,
    isLive: false,
    ...over,
  }
}

function user(over: Partial<FeedUserSignals> = {}): FeedUserSignals {
  return {
    department: 'itapua',
    profession: 'productor',
    interests: [],
    followedOrgIds: new Set(),
    seen: new Map(),
    ...over,
  }
}

describe('señales individuales', () => {
  it('la recencia de una noticia cae a la mitad a las 36 h', () => {
    expect(recencyScore(cand({ publishedAt: hoursAgo(36) }), NOW)).toBeCloseTo(0.5)
    expect(recencyScore(cand({ publishedAt: hoursAgo(0) }), NOW)).toBeCloseTo(1)
  })

  it('un evento vale por recencia hasta que pasa su fecha', () => {
    const future = cand({ contentType: 'evento', startsAt: hoursAgo(-200), publishedAt: hoursAgo(900) })
    const past = cand({ contentType: 'evento', startsAt: hoursAgo(2) })
    expect(recencyScore(future, NOW)).toBe(1)
    expect(recencyScore(past, NOW)).toBe(0)
  })

  it('la cercanía del evento sube desde 72 h y es máxima el día anterior', () => {
    expect(eventProximityScore(cand({ startsAt: hoursAgo(-100) }), NOW)).toBe(0)
    expect(eventProximityScore(cand({ startsAt: hoursAgo(-48) }), NOW)).toBeCloseTo(0.5)
    expect(eventProximityScore(cand({ startsAt: hoursAgo(-10) }), NOW)).toBe(1)
    expect(eventProximityScore(cand({ startsAt: hoursAgo(5) }), NOW)).toBe(0)
  })

  it('el alcance nacional no castiga frente a contenido local de otro departamento', () => {
    const u = user({ department: 'itapua' })
    expect(geoMatch(cand({ targetDepartments: ['itapua'] }), u)).toBe(1)
    expect(geoMatch(cand({ targetDepartments: [] }), u)).toBe(0.5)
    expect(geoMatch(cand({ targetDepartments: ['central'] }), u)).toBe(0)
  })

  it('un item sin datos arranca en la media, no en 0', () => {
    const cold = engagementScore(undefined)
    expect(cold).toBeGreaterThan(0)
    expect(engagementScore({ impressions: 100, likes: 30, saves: 10, ctaOpens: 10 })).toBeGreaterThan(cold)
    expect(engagementScore({ impressions: 1000, likes: 0, saves: 0, ctaOpens: 0 })).toBeLessThan(cold)
  })

  it('lo salteado rápido penaliza más que lo ya visto', () => {
    const c = cand()
    const base = scoreCandidate(c, user(), undefined, DEFAULT_WEIGHTS, NOW)
    const seen = scoreCandidate(c, user({ seen: new Map([[c.key, 'seen']]) }), undefined, DEFAULT_WEIGHTS, NOW)
    const skipped = scoreCandidate(c, user({ seen: new Map([[c.key, 'skipped']]) }), undefined, DEFAULT_WEIGHTS, NOW)
    expect(seen).toBeLessThan(base)
    expect(skipped).toBeLessThan(seen)
  })

  it('seguir a la organización y compartir rubro suben el puntaje', () => {
    const c = cand({ tags: ['ganaderia'], organizationId: 'orgX' })
    const base = scoreCandidate(c, user(), undefined, DEFAULT_WEIGHTS, NOW)
    const follows = scoreCandidate(c, user({ followedOrgIds: new Set(['orgX']) }), undefined, DEFAULT_WEIGHTS, NOW)
    const interested = scoreCandidate(c, user({ interests: ['ganaderia'] }), undefined, DEFAULT_WEIGHTS, NOW)
    expect(follows).toBeGreaterThan(base)
    expect(interested).toBeGreaterThan(base)
  })
})

describe('rankFeed — reglas de mezcla', () => {
  it('no pone dos items seguidos del mismo tipo si hay alternativa', () => {
    const items = [
      cand({ contentType: 'noticia' }),
      cand({ contentType: 'noticia' }),
      cand({ contentType: 'noticia' }),
      cand({ contentType: 'video', publishedAt: hoursAgo(300) }),
      cand({ contentType: 'curso', publishedAt: hoursAgo(300) }),
    ]
    const ranked = rankFeed(items, user(), new Map(), DEFAULT_WEIGHTS, NOW)
    for (let i = 1; i < 4; i++) {
      expect(ranked[i].contentType).not.toBe(ranked[i - 1].contentType)
    }
    expect(ranked).toHaveLength(items.length)
  })

  it('no pone dos items seguidos de la misma organización si hay alternativa', () => {
    const items = [
      cand({ contentType: 'noticia', organizationId: 'A' }),
      cand({ contentType: 'video', organizationId: 'A' }),
      cand({ contentType: 'curso', organizationId: 'B', publishedAt: hoursAgo(500) }),
    ]
    const ranked = rankFeed(items, user(), new Map(), DEFAULT_WEIGHTS, NOW)
    expect(ranked[0].organizationId).not.toBe(ranked[1].organizationId)
  })

  it('reserva ~1 de cada 5 lugares para contenido fuera de los intereses', () => {
    const types: FeedContentType[] = ['noticia', 'video', 'curso', 'empleo', 'producto', 'servicio']
    const inside = Array.from({ length: 12 }, (_, i) => cand({ contentType: types[i % types.length], tags: ['ganaderia'] }))
    const outside = Array.from({ length: 6 }, (_, i) =>
      cand({ contentType: types[i % types.length], tags: ['horticultura'], publishedAt: hoursAgo(200) }),
    )
    const ranked = rankFeed([...inside, ...outside], user({ interests: ['ganaderia'] }), new Map(), DEFAULT_WEIGHTS, NOW)
    const firstTen = ranked.slice(0, 10)
    expect(firstTen.filter((c) => c.tags.includes('horticultura')).length).toBeGreaterThanOrEqual(2)
  })

  it('al actualizar, lo ya visto en la sesión pasa al final sin cambiar el orden del resto', () => {
    const [a, b, c, d] = Array.from({ length: 4 }, () => cand())
    const result = deprioritizeSeen([a, b, c, d], new Set([a.key, c.key])).map((x) => x.key)
    expect(result).toEqual([b.key, d.key, a.key, c.key])
    expect(deprioritizeSeen([a, b], new Set())).toEqual([a, b])
  })

  it('los eventos ocupan sus lugares en orden cronológico, sin mover el resto', () => {
    const nota = cand()
    const dic = cand({ contentType: 'evento', startsAt: hoursAgo(-24 * 60) })
    const hoy = cand({ contentType: 'evento', startsAt: hoursAgo(-5) })
    const otra = cand()
    const out = chronologicalEvents([dic, nota, hoy, otra]).map((c) => c.key)
    expect(out).toEqual([hoy.key, nota.key, dic.key, otra.key])
  })

  it('es determinista: mismas entradas, mismo orden (paginación estable)', () => {
    const items = Array.from({ length: 8 }, () => cand())
    const a = rankFeed(items, user(), new Map(), DEFAULT_WEIGHTS, NOW).map((c) => c.key)
    const b = rankFeed([...items].reverse(), user(), new Map(), DEFAULT_WEIGHTS, NOW).map((c) => c.key)
    expect(a).toEqual(b)
  })
})

describe('spaceOut', () => {
  it('reparte los libros: ninguno antes de la posición 3 y al menos 6 publicaciones entre dos', () => {
    const books = [1, 2, 3].map(() => cand({ contentType: 'libro' }))
    const others = Array.from({ length: 16 }, () => cand())
    const out = spaceOut([...books, ...others], 'libro', 6, 3)
    const positions = out.map((c, i) => (c.contentType === 'libro' ? i : -1)).filter((i) => i >= 0)
    expect(out).toHaveLength(19)
    expect(positions[0]).toBe(3)
    expect(positions[1] - positions[0]).toBeGreaterThanOrEqual(7)
    expect(positions[2] - positions[1]).toBeGreaterThanOrEqual(7)
  })

  it('no pierde libros aunque no haya lugar para separarlos', () => {
    const out = spaceOut([cand({ contentType: 'libro' }), cand({ contentType: 'libro' }), cand()], 'libro', 6, 3)
    expect(out.filter((c) => c.contentType === 'libro')).toHaveLength(2)
  })
})
