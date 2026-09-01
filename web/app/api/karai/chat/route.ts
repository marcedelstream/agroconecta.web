import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { orchestrateMessage } from '@/lib/karai/orchestrator'

// Endpoint channel-agnostic: hoy lo llama el chat web, mas adelante el webhook de WhatsApp puede
// llamar al mismo orquestador (orchestrateMessage) directo sin pasar por HTTP, o via este mismo
// endpoint con channel:'whatsapp' si conviene mantenerlo desacoplado del webhook.
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message : null
  const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : null
  if (!message) {
    return NextResponse.json({ error: 'Falta el mensaje.' }, { status: 400 })
  }

  let admin: ReturnType<typeof createSupabaseAdmin>
  try {
    admin = createSupabaseAdmin()
  } catch (err) {
    console.error('karai/chat: createSupabaseAdmin falló:', err)
    return NextResponse.json({ error: 'El servidor no está configurado.' }, { status: 500 })
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Sesión inválida o expirada.' }, { status: 401 })
  }

  try {
    const result = await orchestrateMessage({
      admin,
      profileId: userData.user.id,
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
