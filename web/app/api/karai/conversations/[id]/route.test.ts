import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFakeAdmin } from '@/lib/karai/test-helpers'

// Aislamiento entre usuarios (la regla más sensible de Karai junto con la de los leads): un usuario
// autenticado NO puede leer, borrar ni renombrar la conversación de otro, aunque conozca su id.
// La auth se reemplaza por un perfil controlado por el test; el resto (consultas con el cliente
// falso, que sí aplica los filtros .eq) corre el código real de la ruta.
const state = vi.hoisted(() => ({ auth: null as unknown }))
vi.mock('@/lib/karai/auth', () => ({ authenticateKaraiRequest: async () => state.auth }))

import { DELETE, GET, PATCH } from './route'

const ALICE = 'user-alice'
const BOB = 'user-bob'
const CONV_ALICE = 'conv-alice'

function seed() {
  return createFakeAdmin({
    conversations: [
      { id: CONV_ALICE, profile_id: ALICE, title: 'Soja 2026' },
      { id: 'conv-bob', profile_id: BOB, title: 'Ganado' },
    ],
    conversation_messages: [
      { conversation_id: CONV_ALICE, role: 'user', content: 'tengo 120 ha de soja', created_at: '2026-11-01T10:00:00Z' },
      { conversation_id: CONV_ALICE, role: 'assistant', content: 'anotado', created_at: '2026-11-01T10:00:05Z' },
      { conversation_id: 'conv-bob', role: 'user', content: 'mensaje de bob', created_at: '2026-11-02T10:00:00Z' },
    ],
  })
}

function actAs(profileId: string, admin: ReturnType<typeof createFakeAdmin>['admin']) {
  state.auth = { admin, profileId }
}

const params = (id: string) => ({ params: Promise.resolve({ id }) })
const req = (method: string, body?: unknown) =>
  new Request('http://localhost/api/karai/conversations/x', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

let db: ReturnType<typeof seed>

beforeEach(() => {
  db = seed()
})

describe('GET /api/karai/conversations/[id]', () => {
  it('el dueño lee sus mensajes', async () => {
    actAs(ALICE, db.admin)
    const res = await GET(req('GET'), params(CONV_ALICE))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.messages.map((m: { content: string }) => m.content)).toEqual(['tengo 120 ha de soja', 'anotado'])
  })

  it('otro usuario recibe 404 y ningún mensaje', async () => {
    actAs(BOB, db.admin)
    const res = await GET(req('GET'), params(CONV_ALICE))
    expect(res.status).toBe(404)
    const text = await res.text()
    expect(text).not.toContain('soja')
    expect(text).not.toContain('messages')
  })

  it('un id inexistente también da 404', async () => {
    actAs(ALICE, db.admin)
    expect((await GET(req('GET'), params('no-existe'))).status).toBe(404)
  })

  it('sin sesión devuelve 401 y no toca la base', async () => {
    state.auth = { error: 'No autorizado.', status: 401 }
    expect((await GET(req('GET'), params(CONV_ALICE))).status).toBe(401)
  })
})

describe('DELETE /api/karai/conversations/[id]', () => {
  it('otro usuario no puede borrar: 404 y la conversación y sus mensajes siguen', async () => {
    actAs(BOB, db.admin)
    const res = await DELETE(req('DELETE'), params(CONV_ALICE))
    expect(res.status).toBe(404)
    expect(db.tables.conversations.map((c) => c.id)).toContain(CONV_ALICE)
    expect(db.tables.conversation_messages.filter((m) => m.conversation_id === CONV_ALICE)).toHaveLength(2)
  })

  it('el dueño borra su conversación (y sus mensajes) sin tocar las de otros', async () => {
    actAs(ALICE, db.admin)
    const res = await DELETE(req('DELETE'), params(CONV_ALICE))
    expect(res.status).toBe(200)
    expect(db.tables.conversations.map((c) => c.id)).toEqual(['conv-bob'])
    expect(db.tables.conversation_messages.map((m) => m.conversation_id)).toEqual(['conv-bob'])
  })
})

describe('PATCH /api/karai/conversations/[id]', () => {
  it('otro usuario no puede renombrar: 404 y el título no cambia', async () => {
    actAs(BOB, db.admin)
    const res = await PATCH(req('PATCH', { title: 'hackeado' }), params(CONV_ALICE))
    expect(res.status).toBe(404)
    expect(db.tables.conversations.find((c) => c.id === CONV_ALICE)?.title).toBe('Soja 2026')
  })

  it('el dueño renombra su conversación', async () => {
    actAs(ALICE, db.admin)
    const res = await PATCH(req('PATCH', { title: 'Zafra de verano' }), params(CONV_ALICE))
    expect(res.status).toBe(200)
    expect(db.tables.conversations.find((c) => c.id === CONV_ALICE)?.title).toBe('Zafra de verano')
    expect(db.tables.conversations.find((c) => c.id === 'conv-bob')?.title).toBe('Ganado')
  })
})
