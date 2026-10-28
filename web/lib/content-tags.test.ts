import { describe, expect, it } from 'vitest'
import { mergeTags } from './content-tags'

const categoryOf = new Map([['sesamo', 'agricultura'], ['tambo', 'ganaderia']])

describe('mergeTags', () => {
  it('suma la etiqueta y su categoría sin duplicar lo que ya traía', () => {
    const [item] = mergeTags([{ key: 'post:1', tags: ['agricultura'] }], [{ content_key: 'post:1', tag: 'sesamo' }], categoryOf)
    expect(item.tags).toEqual(['agricultura', 'sesamo'])
  })

  it('un contenido con etiquetas de dos categorías queda en las dos', () => {
    const rows = [
      { content_key: 'event:expo-2026', tag: 'sesamo' },
      { content_key: 'event:expo-2026', tag: 'tambo' },
    ]
    const [item] = mergeTags([{ key: 'event:expo-2026', tags: [] }], rows, categoryOf)
    expect(item.tags.sort()).toEqual(['agricultura', 'ganaderia', 'sesamo', 'tambo'])
  })

  it('una etiqueta sin categoría conocida se suma igual', () => {
    const [item] = mergeTags([{ key: 'post:1', tags: [] }], [{ content_key: 'post:1', tag: 'stevia' }], categoryOf)
    expect(item.tags).toEqual(['stevia'])
  })

  it('no toca los contenidos sin etiquetas', () => {
    const items = [{ key: 'post:2', tags: ['ganaderia'] }]
    expect(mergeTags(items, [{ content_key: 'post:1', tag: 'sesamo' }], categoryOf)[0]).toBe(items[0])
  })
})
