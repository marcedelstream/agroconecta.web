import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { orchestrateMessageStream } from '@/lib/karai/orchestrator'
import { checkBurst, MAX_MESSAGE_CHARS, messageTooLongReply } from '@/lib/karai/limits'

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
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: messageTooLongReply() }, { status: 400 })
  }

  const burst = checkBurst(auth.profileId)
  if (!burst.ok) {
    return NextResponse.json(
      { error: `Estás escribiendo muy rápido. Esperá ${burst.retryAfterSeconds} segundos y probá de nuevo.` },
      { status: 429, headers: { 'Retry-After': String(burst.retryAfterSeconds) } },
    )
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
