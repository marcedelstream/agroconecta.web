import { afterEach, describe, expect, it, vi } from 'vitest'
import { OpenAIProvider } from './ai-provider'

// `store` omitido = true en /v1/responses (OpenAI guarda la respuesta 30 días). Karai manda siempre
// store:false: si alguien lo quita, estos tests fallan.
const messages = [{ role: 'user' as const, content: 'hola' }]

afterEach(() => vi.unstubAllGlobals())

describe('OpenAIProvider — no guarda las respuestas en OpenAI', () => {
  it('generate() envía store:false', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'ok' }] }], usage: { total_tokens: 3 } })),
    )
    vi.stubGlobal('fetch', fetchMock)

    await new OpenAIProvider('k').generate({ messages })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.store).toBe(false)
  })

  it('generateStream() envía store:false', async () => {
    const sse = 'data: {"type":"response.completed","response":{"usage":{"total_tokens":5}}}\n\n'
    const fetchMock = vi.fn().mockResolvedValue(new Response(sse))
    vi.stubGlobal('fetch', fetchMock)

    const events = []
    for await (const e of new OpenAIProvider('k').generateStream({ messages })) events.push(e)

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.store).toBe(false)
    expect(body.stream).toBe(true)
    expect(events.at(-1)).toEqual({ type: 'done', tokensUsed: 5 })
  })
})
