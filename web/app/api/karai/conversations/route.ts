import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'

// Lista SOLO las conversaciones del usuario autenticado (profileId sale del JWT, nunca del
// cliente) — es lo que alimenta el sidebar de "sesiones" del chat.
export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data, error } = await auth.admin
    .from('conversations')
    .select('id,started_at,last_message_at')
    .eq('profile_id', auth.profileId)
    .order('last_message_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const conversationIds = (data ?? []).map((c) => c.id)
  const previews = new Map<string, string>()

  if (conversationIds.length) {
    const { data: firstMessages } = await auth.admin
      .from('conversation_messages')
      .select('conversation_id,content,role,created_at')
      .in('conversation_id', conversationIds)
      .eq('role', 'user')
      .order('created_at', { ascending: true })

    for (const m of firstMessages ?? []) {
      if (!previews.has(m.conversation_id)) previews.set(m.conversation_id, m.content)
    }
  }

  return NextResponse.json({
    conversations: (data ?? []).map((c) => ({
      id: c.id,
      startedAt: c.started_at,
      lastMessageAt: c.last_message_at,
      preview: previews.get(c.id) ?? 'Nueva conversación',
    })),
  })
}
