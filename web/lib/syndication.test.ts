import { describe, expect, it } from 'vitest'
import { contentForPolicy } from './syndication'

const item = {
  contentHtml: '<p>Texto completo de la nota del medio, con varios párrafos.</p><p>Segundo párrafo.</p>',
  summary: 'Resumen corto de la nota.',
  canonicalUrl: 'https://www.valoragro.com.py/nota',
}

describe('contentForPolicy', () => {
  it('a un medio colega no se le copia la nota: resumen y link a la original', () => {
    const html = contentForPolicy({ name: 'Valor Agro', republish_policy: 'preview_only' }, item)
    expect(html).toContain('Resumen corto de la nota.')
    expect(html).toContain('href="https://www.valoragro.com.py/nota"')
    expect(html).toContain('Leé la nota completa en Valor Agro')
    expect(html).not.toContain('Segundo párrafo')
  })

  it('las fuentes del Estado se republican completas', () => {
    expect(contentForPolicy({ name: 'SENACSA', republish_policy: 'full_republish' }, item)).toBe(item.contentHtml)
  })

  it('escapa lo que viene del feed', () => {
    const html = contentForPolicy({ name: 'Medio', republish_policy: 'preview_only' }, { ...item, summary: '<script>x</script>' })
    expect(html).not.toContain('<script>')
  })
})
