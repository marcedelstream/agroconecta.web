import type { ChatMessage } from './types'

// Adaptador desacoplado del proveedor de IA (KARAI_CONTEXTO_MAESTRO.md secc. 8.1): el resto del
// sistema llama a AIProvider, nunca al SDK/API de OpenAI directo — asi cambiar de proveedor mas
// adelante no implica reescribir el orquestador. Sprint 1 solo implementa `generate`; classify ya
// lo resuelve el clasificador por reglas (classifier.ts) y extract/embed llegan con RAG (fase 2+).
export interface AIProvider {
  generate(input: { messages: ChatMessage[] }): Promise<{ text: string; tokensUsed: number | null }>
}

// gpt-5.6-luna (jul-2026) es modelo de razonamiento — en la practica falla en /v1/chat/completions
// (no soporta `temperature`, y varios clientes reportan que ese endpoint directamente lo rechaza).
// Usamos /v1/responses, que es el endpoint soportado de punta a punta para esta familia de modelos.
const OPENAI_URL = 'https://api.openai.com/v1/responses'
const MODEL = 'gpt-5.6-luna'

interface ResponsesApiOutputItem {
  type?: string
  content?: { type?: string; text?: string }[]
}

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
        input: messages,
        max_output_tokens: 600,
        reasoning: { effort: 'low' },
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`OpenAI error ${res.status}: ${detail}`)
    }

    const data = await res.json()
    const output = (data?.output ?? []) as ResponsesApiOutputItem[]
    const messageItem = output.find((item) => item.type === 'message')
    const textItem = messageItem?.content?.find((c) => c.type === 'output_text')
    const text = textItem?.text

    if (typeof text !== 'string') throw new Error('Respuesta de OpenAI sin contenido.')

    return { text, tokensUsed: data?.usage?.total_tokens ?? null }
  }
}

export function getAIProvider(): AIProvider | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAIProvider(apiKey)
}
