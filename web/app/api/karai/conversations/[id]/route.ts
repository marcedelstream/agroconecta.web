import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'

interface Props {
  params: Promise<{ id: string }>
}

// Devuelve los mensajes de UNA conversación — solo si es del usuario autenticado. El chequeo de
// pertenencia (eq profile_id) es lo único que evita que un usuario lea la conversación de otro
// cambiando el id en la URL.
export async function GET(request: Request, { params }: Props) {
  const { id } = await params
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data: conversation } = await auth.admin
    .from('conversations')
    .select('id')
    .eq('id', id)
    .eq('profile_id', auth.profileId)
    .maybeSingle()

  if (!conversation) return NextResponse.json({ error: 'No encontrada.' }, { status: 404 })

  const { data: messages, error } = await auth.admin
    .from('conversation_messages')
    .select('role,content,created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: messages ?? [] })
}

// Borra la conversación (y sus mensajes, por el on delete cascade de conversation_messages) —
// solo si es del usuario autenticado. Los leads ya generados a partir de esta conversación NO se
// borran (karai_leads.conversation_id es "on delete set null"): el admin igual necesita poder
// contactar a alguien que ya mostró una intención comercial, aunque el usuario borre el chat.
export async function DELETE(request: Request, { params }: Props) {
  const { id } = await params
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data: conversation } = await auth.admin
    .from('conversations')
    .select('id')
    .eq('id', id)
    .eq('profile_id', auth.profileId)
    .maybeSingle()

  if (!conversation) return NextResponse.json({ error: 'No encontrada.' }, { status: 404 })

  const { error } = await auth.admin.from('conversations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// Renombra la conversación — solo si es del usuario autenticado.
export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 120) : null
  if (!title) return NextResponse.json({ error: 'Falta el título.' }, { status: 400 })

  const { data: conversation } = await auth.admin
    .from('conversations')
    .select('id')
    .eq('id', id)
    .eq('profile_id', auth.profileId)
    .maybeSingle()

  if (!conversation) return NextResponse.json({ error: 'No encontrada.' }, { status: 404 })

  const { error } = await auth.admin.from('conversations').update({ title }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
