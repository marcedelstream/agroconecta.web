import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ profileId: 'user-1' }))
const orchestrate = vi.hoisted(() => vi.fn())
vi.mock('@/lib/karai/auth', () => ({
  authenticateKaraiRequest: async () => ({ admin: {}, profileId: state.profileId }),
}))
vi.mock('@/lib/karai/orchestrator', () => ({ orchestrateMessageStream: orchestrate }))

import { POST } from './route'
import { BURST_MAX_MESSAGES, MAX_MESSAGE_CHARS, resetBurstForTests } from '@/lib/karai/limits'

const post = (message: unknown) =>
  POST(
    new Request('http://localhost/api/karai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }),
  )

beforeEach(() => {
  resetBurstForTests()
  orchestrate.mockReset()
  orchestrate.mockResolvedValue({ ok: true, conversationId: 'c1', category: 'agro_information', stream: new ReadableStream() })
  state.profileId = 'user-1'
})

describe('POST /api/karai/chat — topes de entrada', () => {
  it('rechaza con 400 un mensaje más largo que el máximo, sin llamar al orquestador', async () => {
    const res = await post('a'.repeat(MAX_MESSAGE_CHARS + 1))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/demasiado largo/)
    expect(orchestrate).not.toHaveBeenCalled()
  })

  it('acepta un mensaje justo en el máximo', async () => {
    const res = await post('a'.repeat(MAX_MESSAGE_CHARS))
    expect(res.status).toBe(200)
    expect(orchestrate).toHaveBeenCalledTimes(1)
  })

  it('frena una ráfaga con 429 y Retry-After, y no afecta a otro usuario', async () => {
    for (let i = 0; i < BURST_MAX_MESSAGES; i++) expect((await post('hola')).status).toBe(200)

    const blocked = await post('hola')
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect(orchestrate).toHaveBeenCalledTimes(BURST_MAX_MESSAGES)

    state.profileId = 'user-2'
    expect((await post('hola')).status).toBe(200)
  })
})
