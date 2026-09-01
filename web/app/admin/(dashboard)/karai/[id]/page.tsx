import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

interface ConversationRow {
  id: string
  profile_id: string
  channel: string
  started_at: string
}

interface MessageRow {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  scope_category: string | null
  tokens_used: number | null
  created_at: string
}

interface Props {
  params: Promise<{ id: string }>
}

async function loadConversation(id: string) {
  const admin = createSupabaseAdmin()
  const [convRes, messagesRes] = await Promise.all([
    admin.from('conversations').select('id,profile_id,channel,started_at').eq('id', id).maybeSingle(),
    admin.from('conversation_messages').select('id,role,content,scope_category,tokens_used,created_at').eq('conversation_id', id).order('created_at'),
  ])

  const conversation = convRes.data as ConversationRow | null
  if (!conversation) return { conversation: null, messages: [], profile: null }

  const { data: profile } = await admin.from('profiles').select('name,email').eq('id', conversation.profile_id).maybeSingle()

  return { conversation, messages: (messagesRes.data ?? []) as MessageRow[], profile }
}

const ROLE_STYLE: Record<string, string> = {
  user: 'bg-lime/10 border-lime/20',
  assistant: 'bg-secondary border-bdr',
  system: 'bg-warning/10 border-warning/20',
}

export default async function KaraiConversationPage({ params }: Props) {
  const { id } = await params
  const { conversation, messages, profile } = await loadConversation(id)
  if (!conversation) notFound()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/karai" className="text-muted text-sm hover:text-foreground transition-colors">
          ← Karai
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-display font-bold text-xl text-white">{profile?.name ?? 'Sin perfil'}</h1>
        <p className="text-muted text-sm mt-0.5">
          {profile?.email ?? conversation.profile_id} · canal {conversation.channel} · iniciada el{' '}
          {new Date(conversation.started_at).toLocaleString('es-PY')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {messages.length === 0 && <p className="text-muted text-sm">Sin mensajes.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`rounded-xl border p-4 ${ROLE_STYLE[m.role] ?? 'bg-secondary border-bdr'}`}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{m.role}</span>
              <span className="text-muted text-xs">
                {new Date(m.created_at).toLocaleTimeString('es-PY')}
                {m.scope_category ? ` · ${m.scope_category}` : ''}
                {m.tokens_used ? ` · ${m.tokens_used} tokens` : ''}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
