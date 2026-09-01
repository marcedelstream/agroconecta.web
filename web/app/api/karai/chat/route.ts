import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { orchestrateMessageStream } from '@/lib/karai/orchestrator'

// Endpoint channel-agnostic: hoy lo llama el chat web (streaming). El futuro webhook de WhatsApp va
// a usar orchestrateMessage (no-streaming) directo, no este endpoint — un mensaje de WhatsApp llega
// completo, no hace falta tipeo progresivo.
export async function POST(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message : null
  const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : null
  if (!message) {
    return NextResponse.json({ error: 'Falta el mensaje.' }, { status: 400 })
  }

  try {
    const result = await orchestrateMessageStream({
      admin: auth.admin,
      profileId: auth.profileId,
      channel: 'web',
      conversationId,
      message,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return new Response(result.stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Karai-Conversation-Id': result.conversationId,
        'X-Karai-Category': result.category,
      },
    })
  } catch (err) {
    console.error('karai/chat error:', err)
    return NextResponse.json({ error: 'No se pudo procesar el mensaje.' }, { status: 500 })
  }
}
