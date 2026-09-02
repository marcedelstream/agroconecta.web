import { describe, expect, it } from 'vitest'
import { formatPriceLine } from './context'
import { isSourceUsable } from './knowledge-types'

describe('formatPriceLine', () => {
  it('siempre incluye la fecha de actualización, nunca solo el valor', () => {
    const line = formatPriceLine({
      label: 'Novillo gordo',
      market: 'ARP',
      currency: 'PYG',
      unit: 'kg',
      value: 12500,
      updated_at: '2026-08-15T10:00:00Z',
    })
    expect(line).toContain('actualizado el')
    expect(line).toMatch(/\d/)
  })
})

describe('isSourceUsable — nunca usar una fuente vencida o no aprobada', () => {
  const today = '2026-09-02'

  it('una fuente aprobada sin vencimiento es usable', () => {
    expect(isSourceUsable({ status: 'aprobado', expiresAt: null }, today)).toBe(true)
  })

  it('una fuente aprobada y vigente es usable', () => {
    expect(isSourceUsable({ status: 'aprobado', expiresAt: '2026-12-31' }, today)).toBe(true)
  })

  it('una fuente aprobada pero vencida NO es usable', () => {
    expect(isSourceUsable({ status: 'aprobado', expiresAt: '2026-01-01' }, today)).toBe(false)
  })

  it('vence justo hoy — se considera vigente todavía (gte, no gt)', () => {
    expect(isSourceUsable({ status: 'aprobado', expiresAt: today }, today)).toBe(true)
  })

  it('una fuente pendiente de revisión NO es usable aunque no esté vencida', () => {
    expect(isSourceUsable({ status: 'pendiente', expiresAt: null }, today)).toBe(false)
  })

  it('una fuente retirada NO es usable', () => {
    expect(isSourceUsable({ status: 'retirado', expiresAt: '2099-01-01' }, today)).toBe(false)
  })

  it('una fuente marcada vencida NO es usable aunque el campo expires_at diga otra cosa', () => {
    expect(isSourceUsable({ status: 'vencido', expiresAt: null }, today)).toBe(false)
  })
})
