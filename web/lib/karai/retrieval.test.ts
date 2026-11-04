import { describe, expect, it } from 'vitest'
import { ageLabel, mergeUnique, pickRelevant, queryTerms, relevance } from './retrieval'
import { eventStatus } from './events-context'
import { formatPostLine } from './context'

describe('queryTerms', () => {
  it('saca acentos, palabras vacías y plurales, y suma variantes del agro', () => {
    const terms = queryTerms('¿Qué noticias hay de los novillos esta semana?')
    expect(terms).toContain('novillo')
    expect(terms).toContain('ganado')
    expect(terms).not.toContain('noticias')
    expect(terms).not.toContain('semana')
  })

  it('una pregunta sin palabras con peso no busca nada', () => {
    expect(queryTerms('hola, qué tal?')).toEqual([])
  })
})

describe('pickRelevant', () => {
  const posts = [
    { title: 'Lluvias en el Chaco', body: 'pronóstico de la semana' },
    { title: 'Precio del sésamo sube', body: 'exportación de granos' },
    { title: 'Remate de invernada en San Pedro', body: 'ganado' },
  ]

  it('trae lo que tiene que ver con la pregunta aunque no sea lo último', () => {
    const found = pickRelevant(posts, queryTerms('cómo viene el sésamo'), (p) => [p.title, p.body], 3)
    expect(found.map((p) => p.title)).toEqual(['Precio del sésamo sube'])
  })

  it('el título pesa más que el cuerpo', () => {
    expect(relevance(['ganado'], 'Remate de ganado', '')).toBeGreaterThan(relevance(['ganado'], 'Remate', 'ganado'))
  })

  it('sin coincidencias no devuelve nada (el contexto cae a lo más reciente)', () => {
    expect(pickRelevant(posts, queryTerms('cotización del bitcoin'), (p) => [p.title, p.body], 3)).toEqual([])
  })
})

describe('mergeUnique', () => {
  it('no repite una noticia que es relevante y reciente a la vez', () => {
    expect(mergeUnique([{ id: 'a' }, { id: 'b' }], [{ id: 'b' }, { id: 'c' }], (x) => x.id).map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('cronología', () => {
  const now = new Date('2026-11-04T12:00:00-03:00')

  it('ageLabel dice qué tan viejo es cada dato', () => {
    expect(ageLabel('2026-11-04T08:00:00-03:00', now)).toBe('hoy')
    expect(ageLabel('2026-11-03T08:00:00-03:00', now)).toBe('ayer')
    expect(ageLabel('2026-10-30T08:00:00-03:00', now)).toBe('hace 5 días')
    expect(ageLabel('2026-08-01T08:00:00-03:00', now)).toBe('hace 3 meses')
    expect(ageLabel('2025-06-01T08:00:00-03:00', now)).toBe('hace más de un año')
  })

  it('cada noticia lleva fecha y antigüedad', () => {
    const line = formatPostLine({ title: 'Sésamo', summary: 'Sube el precio', category: 'mercados', published_at: '2026-10-30T10:00:00-03:00', slug: 'sesamo' }, now)
    expect(line).toContain('publicada el')
    expect(line).toContain('hace 5 días')
  })

  it('eventStatus distingue terminados, en curso y próximos', () => {
    expect(eventStatus({ date: '2026-11-01', end_date: null }, '2026-11-04')).toBe('terminó')
    expect(eventStatus({ date: '2026-11-03', end_date: '2026-11-06' }, '2026-11-04')).toBe('en curso')
    expect(eventStatus({ date: '2026-11-11', end_date: '2026-11-14' }, '2026-11-04')).toBe('próximo')
  })
})
