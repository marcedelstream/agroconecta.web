import { describe, expect, it, vi } from 'vitest'
import { createFakeAdmin } from './test-helpers'

// El contexto que viaja al proveedor de IA nunca debe incluir el farm_profile de otro usuario. Si
// alguien quita el filtro por profile_id de loadOwnFarmContext, el usuario sin finca (o Bob) pasaría
// a recibir los datos de Alice (la primera fila) y estos tests fallan.
vi.mock('./events-context', () => ({ loadEventsContext: async () => '' }))

import { buildContext } from './context'

function db() {
  return createFakeAdmin({
    posts: [],
    market_prices: [],
    karai_knowledge_sources: [],
    farm_profile: [
      { profile_id: 'alice', data: { nombre: 'Estancia La Alicia', hectareas: 1234, animales: [{ tipo: 'novillos', cantidad: 321 }] } },
      { profile_id: 'bob', data: { nombre: 'Chacra Don Bob', hectareas: 77 } },
    ],
  })
}

describe('buildContext — aislamiento del farm_profile', () => {
  it('incluye solo los datos de finca del usuario autenticado', async () => {
    const { admin } = db()
    const ctx = await buildContext(admin, 'alice', 'precio del novillo')
    expect(ctx).toContain('Estancia La Alicia')
    expect(ctx).toContain('1234')
    expect(ctx).not.toContain('Chacra Don Bob')

    const ctxBob = await buildContext(admin, 'bob', 'precio del novillo')
    expect(ctxBob).toContain('Chacra Don Bob')
    expect(ctxBob).not.toContain('Estancia La Alicia')
    expect(ctxBob).not.toContain('1234')
    expect(ctxBob).not.toContain('novillos')
  })

  it('un usuario sin finca no recibe los datos de nadie más', async () => {
    const { admin } = db()
    const ctx = await buildContext(admin, 'carol', 'hola')
    expect(ctx).not.toContain('Datos de finca')
    expect(ctx).not.toContain('Estancia La Alicia')
    expect(ctx).not.toContain('Chacra Don Bob')
  })

  it('con Mi campo revocado (includeFarm: false) no se lee ni se incluye la finca', async () => {
    const { admin } = db()
    const ctx = await buildContext(admin, 'alice', 'hola', { includeFarm: false })
    expect(ctx).not.toContain('Estancia La Alicia')
    expect(ctx).not.toContain('Datos de finca')
  })
})
