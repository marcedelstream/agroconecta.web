'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ConversationSummary {
  id: string
  startedAt: string
  lastMessageAt: string
  preview: string
}

const WELCOME: DisplayMessage = {
  role: 'assistant',
  content: 'Mba\'éichapa. Soy Karai, el asistente de Agroconecta. Preguntame por precios, noticias, eventos, o contame de tu finca.',
}

async function getToken(): Promise<string> {
  const supabase = createSupabaseBrowser()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sesión expirada, volvé a ingresar.')
  return token
}

export function KaraiChatClient({ email }: { email: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/karai/conversations', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setConversations(data.conversations ?? [])
    } catch {
      // Sidebar es una comodidad, no algo que deba romper el chat si falla.
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/karai/login')
    router.refresh()
  }

  function handleNewConversation() {
    setConversationId(null)
    setMessages([WELCOME])
    setError(null)
    setSidebarOpen(false)
  }

  async function handleDeleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta conversación? No se puede deshacer.')) return

    try {
      const token = await getToken()
      const res = await fetch(`/api/karai/conversations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'No se pudo eliminar.')
      }

      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (id === conversationId) handleNewConversation()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la conversación.')
    }
  }

  async function handleOpenConversation(id: string) {
    setError(null)
    setSidebarOpen(false)
    try {
      const token = await getToken()
      const res = await fetch(`/api/karai/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo abrir la conversación.')

      const loaded: DisplayMessage[] = (data.messages ?? [])
        .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
        .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content }))

      setConversationId(id)
      setMessages(loaded.length ? loaded : [WELCOME])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir la conversación.')
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const token = await getToken()
      const res = await fetch('/api/karai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: trimmed, conversationId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo enviar el mensaje.')

      const isNewConversation = !conversationId
      setConversationId(data.conversationId)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      if (isNewConversation) loadConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <aside
        className={`w-64 shrink-0 border-r border-bdr flex-col bg-bg ${
          sidebarOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden md:flex'
        }`}
      >
        <div className="p-4 border-b border-bdr flex items-center justify-between">
          <p className="font-display font-semibold text-foreground text-sm">Conversaciones</p>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted text-sm">✕</button>
        </div>
        <div className="p-3">
          <button onClick={handleNewConversation} className="btn-primary w-full text-sm">
            + Nueva conversación
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-1 rounded-lg transition-colors ${
                c.id === conversationId ? 'bg-lime/15' : 'hover:bg-secondary'
              }`}
            >
              <button onClick={() => handleOpenConversation(c.id)} className="flex-1 min-w-0 text-left px-3 py-2.5 text-sm">
                <p className={`line-clamp-1 ${c.id === conversationId ? 'text-foreground' : 'text-muted'}`}>{c.preview}</p>
                <p className="text-xs text-muted mt-0.5">{new Date(c.lastMessageAt).toLocaleDateString('es-PY')}</p>
              </button>
              <button
                onClick={(e) => handleDeleteConversation(c.id, e)}
                title="Eliminar conversación"
                className="shrink-0 px-2 text-muted/60 hover:text-danger transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          {conversations.length === 0 && <p className="text-muted text-xs px-3 py-2">Sin conversaciones todavía.</p>}
        </div>
        <div className="p-3 border-t border-bdr">
          <Link href="/karai/mis-datos" className="text-sm text-lime hover:text-lime-dark transition-colors">
            Mis datos →
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-bdr px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden btn text-xs shrink-0">☰</button>
            <div className="min-w-0">
              <p className="font-display font-semibold text-foreground">Karai</p>
              <p className="text-muted text-xs truncate">{email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="btn text-xs shrink-0">Cerrar sesión</button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-lime text-bg' : 'bg-secondary text-foreground border border-bdr'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary border border-bdr rounded-2xl px-4 py-2.5 text-sm text-muted">
                  Escribiendo...
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger max-w-[85%]">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        <form onSubmit={handleSend} className="border-t border-bdr px-5 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribile a Karai..."
              className="input flex-1"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary shrink-0">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
