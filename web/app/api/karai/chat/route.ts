import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { orchestrateMessage } from '@/lib/karai/orchestrator'

// Endpoint channel-agnostic: hoy lo llama el chat web, mas adelante el webhook de WhatsApp puede
// llamar al mismo orquestador (orchestrateMessage) directo sin pasar por HTTP, o via este mismo
// endpoint con channel:'whatsapp' si conviene mantenerlo desacoplado del webhook.
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
    const result = await orchestrateMessage({
      admin: auth.admin,
      profileId: auth.profileId,
      channel: 'web',
      conversationId,
      message,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      reply: result.reply,
      conversationId: result.conversationId,
      category: result.category,
    })
  } catch (err) {
    console.error('karai/chat error:', err)
    return NextResponse.json({ error: 'No se pudo procesar el mensaje.' }, { status: 500 })
  }
}
