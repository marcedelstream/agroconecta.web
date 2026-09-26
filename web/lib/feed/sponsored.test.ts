import { describe, expect, it } from 'vitest'
import { interleaveEvery } from './interactive'
import { matchesTargeting, SPONSORED_EVERY, SPONSORED_FIRST_POSITION } from './sponsored'

const user = { department: 'itapua', profession: 'productor', interests: ['ganaderia'] }

describe('publicidad en el feed', () => {
  it('segmentación vacía = todos; con valores, el usuario tiene que coincidir', () => {
    expect(matchesTargeting({ target_professions: [], target_departments: null, target_categories: [] }, user)).toBe(true)
    expect(matchesTargeting({ target_professions: ['productor'], target_departments: ['itapua'], target_categories: ['ganaderia'] }, user)).toBe(true)
    expect(matchesTargeting({ target_professions: ['veterinario'], target_departments: [], target_categories: [] }, user)).toBe(false)
    expect(matchesTargeting({ target_professions: [], target_departments: ['central'], target_categories: [] }, user)).toBe(false)
    expect(matchesTargeting({ target_professions: [], target_departments: [], target_categories: ['agricultura'] }, user)).toBe(false)
  })

  it('nunca en las primeras posiciones y uno cada 7', () => {
    const items = Array.from({ length: 30 }, (_, i) => `c${i}`)
    const out = interleaveEvery(items, ['AD1', 'AD2'], SPONSORED_FIRST_POSITION, SPONSORED_EVERY)
    expect(out.indexOf('AD1')).toBeGreaterThan(1)
    expect(out.indexOf('AD2') - out.indexOf('AD1')).toBe(SPONSORED_EVERY)
  })
})
