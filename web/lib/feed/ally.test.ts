import { describe, expect, it } from 'vitest'
import { groupAllyItems } from './ally'
import type { FeedContentItem, FeedContentType } from './types'

const item = (key: string, contentType: FeedContentType, startsAt: string | null = null) =>
  ({ key, contentType, startsAt }) as FeedContentItem

describe('groupAllyItems', () => {
  const now = new Date('2026-10-28T12:00:00Z')

  it('separa eventos, noticias y cursos', () => {
    const page = groupAllyItems([item('a', 'noticia'), item('b', 'curso'), item('c', 'evento', '2026-11-04T08:00:00Z'), item('d', 'video')], now)
    expect(page.events.map((i) => i.key)).toEqual(['c'])
    expect(page.news.map((i) => i.key)).toEqual(['a', 'd'])
    expect(page.learn.map((i) => i.key)).toEqual(['b'])
  })

  it('ordena los eventos por fecha y saca los que ya pasaron', () => {
    const page = groupAllyItems(
      [item('tarde', 'evento', '2026-12-01T08:00:00Z'), item('pasado', 'evento', '2026-10-01T08:00:00Z'), item('pronto', 'evento', '2026-11-02T08:00:00Z')],
      now,
    )
    expect(page.events.map((i) => i.key)).toEqual(['pronto', 'tarde'])
  })

  it('un evento de hoy que ya arrancó sigue apareciendo', () => {
    const page = groupAllyItems([item('hoy', 'evento', '2026-10-28T08:00:00Z')], now)
    expect(page.events).toHaveLength(1)
  })
})
