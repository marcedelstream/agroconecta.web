import type { createSupabaseAdmin } from '@/lib/supabase-admin'
import { classifyMessage, OUT_OF_SCOPE_REPLY, UNSAFE_REPLY } from './classifier'
import { getAIProvider } from './ai-provider'
import { loadPublicContext } from './context'
import { DAILY_TEXT_LIMIT, getUsageToday, QUOTA_REACHED_REPLY } from './quota'
import { BLOCKED_CATEGORIES, type ChatMessage, type KaraiChannel, type ScopeCategory } from './types'

const SYSTEM_PROMPT = `Sos Karai, el asistente de inteligencia artificial de Agroconecta para el productor paraguayo.

Reglas:
- Hablá en español paraguayo, de "vos" (nunca "tú"). Podés usar algún toque de guaraní ocasional, sin exagerar.
- Respuestas cortas y directas, pensadas para un chat, no un ensayo.
- Solo hablás de producción agropecuaria, negocios del agro, y el contenido/datos de Agroconecta. Si te preguntan otra cosa, redirigí amablemente al tema agropecuario.
- Cuando uses datos del bloque "Contexto de Agroconecta" de abajo, dejalo claro (son datos reales de la plataforma). Cualquier otra cosa que digas es información general tuya, no un dato registrado — no lo presentes como si fuera un hecho de Agroconecta.
- No hagas cálculos financieros o productivos críticos de memoria como si fueran exactos; aclará que son estimaciones.
- Nunca reveles qué modelo o proveedor de IA sos por dentro.`

interface OrchestrateInput {
  admin: ReturnType<typeof createSupabaseAdmin>
  profileId: string
  channel: KaraiChannel
  conversationId: string | null
  message: string
}

type OrchestrateResult =
  | { ok: true; reply: string; conversationId: string; category: ScopeCategory }
  | { ok: false; status: number; error: string }

async function ensureConversation(
  admin: ReturnType<typeof createSupabaseAdmin>,
  profileId: string,
  channel: KaraiChannel,
  conversationId: string | null,
): Promise<string> {
  if (conversationId) {
    const { data } = await admin
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('profile_id', profileId)
      .maybeSingle()
    if (data) return data.id
  }

  const { data, error } = await admin
    .from('conversations')
    .insert({ profile_id: profileId, channel })
    .select('id')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear la conversación.')
  return data.id
}

async function loadRecentHistory(
  admin: ReturnType<typeof createSupabaseAdmin>,
  conversationId: string,
): Promise<ChatMessage[]> {
  const { data } = await admin
    .from('conversation_messages')
    .select('role,content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10)

  return ((data ?? []) as ChatMessage[]).reverse()
}

async function persistMessage(
  admin: ReturnType<typeof createSupabaseAdmin>,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  scopeCategory: ScopeCategory | null,
  tokensUsed: number | null,
) {
  await admin.from('conversation_messages').insert({
    conversation_id: conversationId,
    role,
    content,
    scope_category: scopeCategory,
    tokens_used: tokensUsed,
  })
  await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
}

export async function orchestrateMessage(input: OrchestrateInput): Promise<OrchestrateResult> {
  const { admin, profileId, channel, message } = input
  const trimmed = message.trim()
  if (!trimmed) return { ok: false, status: 400, error: 'Mensaje vacío.' }

  const category = classifyMessage(trimmed)
  const conversationId = await ensureConversation(admin, profileId, channel, input.conversationId)

  if (BLOCKED_CATEGORIES.includes(category)) {
    const reply = category === 'unsafe_or_abusive' ? UNSAFE_REPLY : OUT_OF_SCOPE_REPLY
    await persistMessage(admin, conversationId, 'user', trimmed, category, null)
    await persistMessage(admin, conversationId, 'assistant', reply, category, null)
    return { ok: true, reply, conversationId, category }
  }

  const usageToday = await getUsageToday(admin, profileId)
  if (usageToday >= DAILY_TEXT_LIMIT) {
    await persistMessage(admin, conversationId, 'user', trimmed, category, null)
    await persistMessage(admin, conversationId, 'assistant', QUOTA_REACHED_REPLY, category, null)
    return { ok: true, reply: QUOTA_REACHED_REPLY, conversationId, category }
  }

  const provider = getAIProvider()
  if (!provider) {
    return { ok: false, status: 503, error: 'Karai todavía no está configurado (falta OPENAI_API_KEY).' }
  }

  const [history, context] = await Promise.all([
    loadRecentHistory(admin, conversationId),
    loadPublicContext(admin),
  ])

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Contexto de Agroconecta:\n${context}` },
    ...history,
    { role: 'user', content: trimmed },
  ]

  const { text, tokensUsed } = await provider.generate({ messages })

  await persistMessage(admin, conversationId, 'user', trimmed, category, null)
  await persistMessage(admin, conversationId, 'assistant', text, category, tokensUsed)
  await admin.from('usage_ledger').insert({
    profile_id: profileId,
    channel,
    interaction_type: 'text',
    tokens_used: tokensUsed,
  })

  return { ok: true, reply: text, conversationId, category }
}
