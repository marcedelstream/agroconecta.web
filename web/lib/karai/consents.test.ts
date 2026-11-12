import { describe, expect, it, vi } from 'vitest'
import { createFakeAdmin } from './test-helpers'
import { CONSENT_AI, CONSENT_FARM, CONSENT_POLICY_VERSION, getConsentState, recordFirstUse, resolveFarmConsent, setConsent } from './consents'

describe('consentimientos de Karai', () => {
  it('sin registro el estado es "none"; el primer uso registra un otorgamiento con la versión de la política', async () => {
    const { admin, tables } = createFakeAdmin({ consents: [] })
    expect(await getConsentState(admin, 'u1', CONSENT_AI)).toBe('none')

    expect(await recordFirstUse(admin, 'u1', CONSENT_AI)).toBe('granted')
    expect(tables.consents).toHaveLength(1)
    expect(tables.consents[0]).toMatchObject({
      profile_id: 'u1',
      consent_type: CONSENT_AI,
      status: 'granted',
      metadata: { source: 'first_use', policy_version: CONSENT_POLICY_VERSION },
    })
  })

  it('usar de nuevo no duplica el registro', async () => {
    const { admin, tables } = createFakeAdmin({ consents: [] })
    await recordFirstUse(admin, 'u1', CONSENT_AI)
    await recordFirstUse(admin, 'u1', CONSENT_AI)
    expect(tables.consents).toHaveLength(1)
  })

  it('revocar marca el otorgamiento como revocado y el primer uso NO lo reactiva', async () => {
    const { admin, tables } = createFakeAdmin({ consents: [] })
    await recordFirstUse(admin, 'u1', CONSENT_FARM)
    await setConsent(admin, 'u1', CONSENT_FARM, false)

    expect(await getConsentState(admin, 'u1', CONSENT_FARM)).toBe('revoked')
    expect(tables.consents[0].revoked_at).toBeTruthy()

    expect(await recordFirstUse(admin, 'u1', CONSENT_FARM)).toBe('revoked')
    expect(tables.consents).toHaveLength(1)
  })

  it('el usuario puede volver a activar tras revocar', async () => {
    const { admin } = createFakeAdmin({ consents: [] })
    await recordFirstUse(admin, 'u1', CONSENT_AI)
    await setConsent(admin, 'u1', CONSENT_AI, false)
    await setConsent(admin, 'u1', CONSENT_AI, true)
    expect(await getConsentState(admin, 'u1', CONSENT_AI)).toBe('granted')
  })

  it('revocar un consentimiento no afecta al de otro usuario ni al de otro tipo', async () => {
    const { admin } = createFakeAdmin({ consents: [] })
    await recordFirstUse(admin, 'u1', CONSENT_AI)
    await recordFirstUse(admin, 'u1', CONSENT_FARM)
    await recordFirstUse(admin, 'u2', CONSENT_AI)

    await setConsent(admin, 'u1', CONSENT_AI, false)

    expect(await getConsentState(admin, 'u1', CONSENT_AI)).toBe('revoked')
    expect(await getConsentState(admin, 'u1', CONSENT_FARM)).toBe('granted')
    expect(await getConsentState(admin, 'u2', CONSENT_AI)).toBe('granted')
  })

  it('una condición de carrera (23505 del índice único) no es un error', async () => {
    const { admin } = createFakeAdmin({ consents: [] })
    const original = admin.from.bind(admin)
    // El segundo insert simultáneo choca con el índice único parcial.
    vi.spyOn(admin, 'from').mockImplementation((table: string) => {
      const q = original(table)
      if (table === 'consents') {
        q.insert = (() => Promise.resolve({ data: null, error: { code: '23505', message: 'duplicate key' } })) as unknown as typeof q.insert
      }
      return q
    })
    await expect(recordFirstUse(admin, 'u1', CONSENT_AI)).resolves.toBe('granted')
  })
})

describe('resolveFarmConsent', () => {
  it('revocado → false', async () => {
    const { admin } = createFakeAdmin({ consents: [{ profile_id: 'u1', consent_type: CONSENT_FARM, status: 'revoked' }], farm_profile: [] })
    expect(await resolveFarmConsent(admin, 'u1')).toBe(false)
  })

  it('sin registro pero con datos de finca previos → se usa y queda registrado', async () => {
    const { admin, tables } = createFakeAdmin({ consents: [], farm_profile: [{ profile_id: 'u1', data: { hectareas: 10 } }] })
    expect(await resolveFarmConsent(admin, 'u1')).toBe(true)
    expect(tables.consents).toHaveLength(1)
  })

  it('sin registro y sin datos de finca → se permite pero no se registra nada todavía', async () => {
    const { admin, tables } = createFakeAdmin({ consents: [], farm_profile: [] })
    expect(await resolveFarmConsent(admin, 'u1')).toBe(true)
    expect(tables.consents).toHaveLength(0)
  })

  it('los datos de finca de OTRO usuario no cuentan como uso propio', async () => {
    const { admin, tables } = createFakeAdmin({ consents: [], farm_profile: [{ profile_id: 'u2', data: { hectareas: 10 } }] })
    await resolveFarmConsent(admin, 'u1')
    expect(tables.consents).toHaveLength(0)
  })
})
