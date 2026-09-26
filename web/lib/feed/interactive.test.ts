import { describe, expect, it } from 'vitest'
import { INTERACTIVE_EVERY, INTERACTIVE_FIRST_POSITION, interleaveInteractive } from './interactive'

describe('interleaveInteractive', () => {
  const items = Array.from({ length: 20 }, (_, i) => `c${i}`)

  it('pone el primero en la posición 4 y después uno cada 8', () => {
    const out = interleaveInteractive(items, ['A', 'B', 'C'])
    expect(out.indexOf('A')).toBe(INTERACTIVE_FIRST_POSITION)
    expect(out.indexOf('B')).toBe(INTERACTIVE_FIRST_POSITION + INTERACTIVE_EVERY)
    expect(out.indexOf('C')).toBe(INTERACTIVE_FIRST_POSITION + 2 * INTERACTIVE_EVERY)
    expect(out).toHaveLength(23)
  })

  it('no inventa lugares si no hay suficiente contenido, y sin interactivos no cambia nada', () => {
    expect(interleaveInteractive(['x', 'y'], ['A'])).toEqual(['x', 'y'])
    expect(interleaveInteractive(items, [])).toEqual(items)
  })
})
