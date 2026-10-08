import { describe, expect, it } from 'vitest'
import { normalizeArticleHtml } from './content-html'

describe('normalizeArticleHtml', () => {
  it('texto plano: un párrafo por renglón', () => {
    expect(normalizeArticleHtml('Uno.\r\n\r\nDos.')).toBe('<p>Uno.</p><p>Dos.</p>')
  })

  it('texto escrito a mano con una foto en el medio no queda corrido', () => {
    const raw = 'Primer párrafo.\r\n\r\n<figure><img src="https://x/y.jpg" alt="" /><figcaption>Foto</figcaption></figure>\r\n\r\nSegundo.\r\n\r\nTercero con <strong>negrita</strong>.'
    expect(normalizeArticleHtml(raw)).toBe(
      '<p>Primer párrafo.</p><figure><img src="https://x/y.jpg" alt="" /><figcaption>Foto</figcaption></figure><p>Segundo.</p><p>Tercero con <strong>negrita</strong>.</p>',
    )
  })

  it('HTML ya armado queda igual', () => {
    const html = '<p>Uno.</p><h2>Sub</h2><ul><li>a</li></ul>'
    expect(normalizeArticleHtml(html)).toBe(html)
  })
})
