import type { ChatMessage } from './types'

// Adaptador desacoplado del proveedor de IA (KARAI_CONTEXTO_MAESTRO.md secc. 8.1): el resto del
// sistema llama a AIProvider, nunca al SDK/API de OpenAI directo — asi cambiar de proveedor mas
// adelante no implica reescribir el orquestador. Sprint 1 solo implementa `generate`; classify ya
// lo resuelve el clasificador por reglas (classifier.ts) y extract/embed llegan con RAG (fase 2+).
export interface AIProvider {
  generate(input: { messages: ChatMessage[] }): Promise<{ text: string; tokensUsed: number | null }>
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
// gpt-5.6-luna (jul-2026): tier mas barato de la familia GPT-5.6 vigente, pensado para chat/
// clasificacion de alto volumen — reemplaza a gpt-4o-mini (generacion anterior) para este caso
// de uso. Ver KARAI-MODELO-NEGOCIO.md secc. "por que el limite no es (solo) por costo de OpenAI".
const MODEL = 'gpt-5.6-luna'

export class OpenAIProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}

  async generate({ messages }: { messages: ChatMessage[] }): Promise<{ text: string; tokensUsed: number | null }> {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 500,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`OpenAI error ${res.status}: ${detail}`)
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (typeof text !== 'string') throw new Error('Respuesta de OpenAI sin contenido.')

    return { text, tokensUsed: data?.usage?.total_tokens ?? null }
  }
}

export function getAIProvider(): AIProvider | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAIProvider(apiKey)
}
