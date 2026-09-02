import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'

// El botón "Avisar a Agroconecta" del chat — a diferencia de recordLeadIfCommercial (automático,
// via clasificador), esto es el usuario pidiendo explícitamente que lo contacten sobre lo que se
// está hablando en ese momento, aunque el clasificador no lo haya detectado como
// commercial_opportunity. Mismo destino (karai_leads), mismo criterio de privacidad: solo el
// excerpt puntual, nunca la conversación completa.
export async function POST(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => null)
  const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : null
  const excerpt = typeof body?.excerpt === 'string' ? body.excerpt.trim() : ''
  if (!excerpt) return NextResponse.json({ error: 'Falta el mensaje a compartir.' }, { status: 400 })

  if (conversationId) {
    const { data: conversation } = await auth.admin
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('profile_id', auth.profileId)
      .maybeSingle()
    if (!conversation) return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404 })
  }

  const { error } = await auth.admin.from('karai_leads').insert({
    profile_id: auth.profileId,
    conversation_id: conversationId,
    excerpt,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
