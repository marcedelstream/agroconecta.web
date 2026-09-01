'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ConversationSummary {
  id: string
  startedAt: string
  lastMessageAt: string
  title: string | null
  preview: string
}

const WELCOME: DisplayMessage = {
  role: 'assistant',
  content: `Mba'éichapa, soy Karai, el asistente de Agroconecta. Puedo ayudarte con:

- **Precios** de mercado, ganadería y commodities
- **Noticias** del agro paraguayo
- **Eventos** del sector, con fecha y lugar
- **Cargar los datos de tu finca** (animales, hectáreas, cultivos) solo contándomelos
- Avisarle a Agroconecta si tenés algo para **comprar o vender**

¿Por dónde arrancamos?`,
}

const SUGGESTIONS = ['¿Qué precios tenés hoy?', '¿Qué eventos vienen?', 'Últimas noticias del agro', 'Quiero contarte de mi finca']

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-lime">
      {children}
    </a>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-bg/50 px-1 py-0.5 rounded text-xs">{children}</code>
  ),
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
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

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

  const loadQuota = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/karai/quota', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setQuota({ used: data.used, limit: data.limit })
    } catch {
      // No crítico para poder chatear.
    }
  }, [])

  useEffect(() => {
    loadConversations()
    loadQuota()
  }, [loadConversations, loadQuota])

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/karai/login')
    router.refresh()
  }

  function handleNewConversation() {
    abortRef.current?.abort()
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

  async function handleRenameSubmit(id: string) {
    const title = renameValue.trim()
    setRenamingId(null)
    if (!title) return

    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title, preview: title } : c)))
    try {
      const token = await getToken()
      await fetch(`/api/karai/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      })
    } catch {
      loadConversations()
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

  // Al entrar con ?c=<id> en la URL (ej. después de refrescar la página), reabre esa
  // conversación en vez de arrancar en blanco.
  useEffect(() => {
    const fromUrl = searchParams.get('c')
    if (fromUrl) handleOpenConversation(fromUrl)
    // Solo al montar — no queremos reabrir cada vez que cambia algo no relacionado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mantiene la URL en sync con la conversación activa, así un refresh no la pierde.
  useEffect(() => {
    const url = conversationId ? `/karai?c=${conversationId}` : '/karai'
    router.replace(url, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  const sendMessage = useCallback(
    async (text: string, opts?: { skipUserBubble?: boolean }) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      setError(null)
      if (!opts?.skipUserBubble) setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
      setLoading(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const token = await getToken()
        const res = await fetch('/api/karai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: trimmed, conversationId }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error ?? 'No se pudo enviar el mensaje.')
        }

        const newConversationId = res.headers.get('X-Karai-Conversation-Id')
        const wasNewConversation = !conversationId
        if (newConversationId) setConversationId(newConversationId)

        const reader = res.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            setMessages((prev) => {
              const next = [...prev]
              next[next.length - 1] = { role: 'assistant', content: next[next.length - 1].content + chunk }
              return next
            })
          }
        }

        if (wasNewConversation) loadConversations()
        loadQuota()
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Detenido a pedido del usuario — dejamos lo que ya se escribió, sin error.
        } else {
          setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.')
          setMessages((prev) => prev.slice(0, -1))
        }
      } finally {
        setLoading(false)
        abortRef.current = null
      }
    },
    [loading, conversationId, loadConversations, loadQuota],
  )

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    sendMessage(trimmed)
  }

  function handleStop() {
    abortRef.current?.abort()
  }

  function handleRegenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser || loading) return
    setMessages((prev) => {
      // Saca la última respuesta del asistente (si la hay) para reemplazarla visualmente.
      const next = [...prev]
      if (next[next.length - 1]?.role === 'assistant') next.pop()
      return next
    })
    sendMessage(lastUser.content, { skipUserBubble: true })
  }

  function handleCopy(index: number, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex((i) => (i === index ? null : i)), 1500)
    })
  }

  const isFreshConversation = messages.length === 1

  return (
    <div className="h-screen flex overflow-hidden">
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
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3 flex flex-col gap-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-1 rounded-lg transition-colors ${
                c.id === conversationId ? 'bg-lime/15' : 'hover:bg-secondary'
              }`}
            >
              {renamingId === c.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(c.id)
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  className="flex-1 min-w-0 mx-2 my-1.5 px-2 py-1 text-sm rounded bg-secondary border border-bdr text-foreground"
                />
              ) : (
                <button onClick={() => handleOpenConversation(c.id)} className="flex-1 min-w-0 text-left px-3 py-2.5 text-sm">
                  <p className={`line-clamp-1 ${c.id === conversationId ? 'text-foreground' : 'text-muted'}`}>{c.preview}</p>
                  <p className="text-xs text-muted mt-0.5">{new Date(c.lastMessageAt).toLocaleDateString('es-PY')}</p>
                </button>
              )}
              {renamingId !== c.id && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setRenamingId(c.id)
                      setRenameValue(c.title ?? c.preview)
                    }}
                    title="Renombrar"
                    className="shrink-0 px-1.5 text-muted/60 hover:text-foreground transition-colors"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    title="Eliminar conversación"
                    className="shrink-0 px-2 text-muted/60 hover:text-danger transition-colors"
                  >
                    ✕
                  </button>
                </>
              )}
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

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="border-b border-bdr px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden btn text-xs shrink-0">☰</button>
            <div className="min-w-0">
              <p className="font-display font-semibold text-foreground">Karai</p>
              <p className="text-muted text-xs truncate">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {quota && (
              <span className="text-muted text-xs hidden sm:inline">
                {quota.used}/{quota.limit} hoy
              </span>
            )}
            <button onClick={handleSignOut} className="btn text-xs">Cerrar sesión</button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto px-5 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {messages.map((m, i) => {
              const isLastAssistant = m.role === 'assistant' && i === messages.length - 1
              const isEmpty = m.role === 'assistant' && m.content === ''
              return (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-lime text-bg' : 'bg-secondary text-foreground border border-bdr'
                    }`}
                  >
                    {isEmpty && loading ? (
                      <span className="text-muted">Escribiendo...</span>
                    ) : m.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{m.content}</ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                  {m.role === 'assistant' && !isEmpty && (!loading || !isLastAssistant) && (
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <button onClick={() => handleCopy(i, m.content)} className="text-muted text-xs hover:text-foreground transition-colors">
                        {copiedIndex === i ? 'Copiado' : 'Copiar'}
                      </button>
                      {isLastAssistant && (
                        <button onClick={handleRegenerate} className="text-muted text-xs hover:text-foreground transition-colors">
                          Regenerar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {isFreshConversation && !loading && (
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="btn text-xs">
                    {s}
                  </button>
                ))}
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

        <form onSubmit={handleSend} className="border-t border-bdr px-5 py-4 shrink-0">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribile a Karai..."
              className="input flex-1"
              disabled={loading}
            />
            {loading ? (
              <button type="button" onClick={handleStop} className="btn shrink-0">
                Detener
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="btn-primary shrink-0">
                Enviar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
