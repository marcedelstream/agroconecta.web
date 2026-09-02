'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

const SUGGESTIONS = ['Precios de hoy', 'Eventos del sector', 'Últimas noticias del agro', 'Quiero contarte de mi finca']

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-[var(--k-text)]">{children}</strong>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-[var(--k-lime)] hover:text-[var(--k-lime-hover)]">
      {children}
    </a>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-[var(--k-bg)] px-1 py-0.5 rounded text-xs font-[family-name:var(--font-karai-mono)]">{children}</code>
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
  const [notifiedIndex, setNotifiedIndex] = useState<number | null>(null)
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

  async function handleNotifyInterest(index: number) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    try {
      const token = await getToken()
      const res = await fetch('/api/karai/notify-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId, excerpt: lastUser.content }),
      })
      if (!res.ok) throw new Error()
      setNotifiedIndex(index)
    } catch {
      setError('No se pudo avisar a Agroconecta, intentá de nuevo.')
    }
  }

  const isFreshConversation = messages.length === 1
  const quotaPercent = quota ? Math.min(100, Math.round((quota.used / Math.max(quota.limit, 1)) * 100)) : 0

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--k-bg)] text-[var(--k-text)]">
      <aside
        className={`w-[284px] shrink-0 border-r border-[var(--k-border)] bg-[var(--k-sidebar)] flex-col min-h-0 ${
          sidebarOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden md:flex'
        }`}
      >
        <div className="px-[18px] pt-[18px] pb-3.5 flex items-center gap-2.5">
          <Image src="/karai-avatar.png" alt="Karai" width={36} height={36} className="rounded-xl block" />
          <div className="min-w-0 flex flex-col gap-0.5">
            <p className="text-[15px] font-extrabold tracking-[-0.01em] text-[var(--k-text)]">Karai</p>
            <p className="text-[11px] font-medium text-[var(--k-muted-3)] tracking-wide">IA oficial del agro paraguayo</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-[var(--k-muted)] text-sm">✕</button>
        </div>

        <div className="px-3.5 pb-3.5">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] text-[#0A1424] rounded-xl py-2.5 px-3.5 text-[13.5px] font-bold cursor-pointer transition-colors"
          >
            <span className="text-[15px] leading-none">+</span>Nueva conversación
          </button>
        </div>

        <p className="m-0 px-5 pb-2 text-[10.5px] font-bold tracking-[.1em] uppercase text-[var(--k-muted-3)]">Conversaciones</p>

        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-2.5 flex flex-col gap-0.5">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`relative flex items-center gap-1 rounded-[11px] transition-colors ${
                c.id === conversationId ? 'bg-[var(--k-user-bubble)]' : 'hover:bg-[#101B2E]'
              }`}
            >
              {c.id === conversationId && (
                <div className="absolute left-0 top-[11px] bottom-[11px] w-[2.5px] rounded-full bg-[var(--k-lime)]" />
              )}
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
                  className="flex-1 min-w-0 mx-2 my-1.5 px-2 py-1 text-sm rounded bg-[var(--k-bg)] border border-[var(--k-border-strong)] text-[var(--k-text)] outline-none focus:border-[var(--k-lime)]"
                />
              ) : (
                <button onClick={() => handleOpenConversation(c.id)} className="flex-1 min-w-0 text-left px-2.5 pl-3.5 py-2.5 flex flex-col gap-0.5">
                  <p className={`text-[13px] font-medium line-clamp-1 ${c.id === conversationId ? 'text-[var(--k-text)] font-semibold' : 'text-[var(--k-muted)]'}`}>
                    {c.preview}
                  </p>
                  <p className="text-[11px] font-medium text-[var(--k-muted-3)] font-[family-name:var(--font-karai-mono)]">
                    {new Date(c.lastMessageAt).toLocaleDateString('es-PY')}
                  </p>
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
                    className="shrink-0 px-1.5 text-[var(--k-muted-3)] hover:text-[var(--k-text)] transition-colors"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    title="Eliminar conversación"
                    className="shrink-0 px-2 text-[var(--k-muted-3)] hover:text-[var(--k-negative)] transition-colors"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
          {conversations.length === 0 && <p className="text-[var(--k-muted-3)] text-xs px-3.5 py-2">Sin conversaciones todavía.</p>}
        </div>

        <div className="border-t border-[var(--k-border)] p-3 flex flex-col gap-2">
          <Link
            href="/karai/mis-datos"
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-[#0E1829] border border-[var(--k-border)] hover:border-[var(--k-border-hover)] transition-colors"
          >
            <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] bg-[var(--k-user-bubble)] flex items-center justify-center text-[var(--k-lime)] font-[family-name:var(--font-karai-mono)] text-xs font-bold">
              MD
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <p className="text-[12.5px] font-semibold text-[var(--k-text)] truncate">Mis datos</p>
              <p className="text-[11px] font-medium text-[var(--k-muted-3)] truncate">Lo que Karai sabe de tu finca</p>
            </div>
            <span className="text-[var(--k-muted-3)] text-sm">→</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="shrink-0 h-[60px] border-b border-[var(--k-border)] px-[22px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[var(--k-muted)] text-sm shrink-0">☰</button>
            <p className="text-sm font-bold text-[var(--k-text)] tracking-[-0.01em] truncate">
              {conversations.find((c) => c.id === conversationId)?.preview ?? 'Karai'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {quota && (
              <div className="flex items-center gap-2.5 bg-[var(--k-card)] border border-[var(--k-border-strong)] rounded-full py-1.5 pl-[11px] pr-3">
                <div className="w-[52px] h-[5px] rounded-full bg-[var(--k-border-strong)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--k-lime)]" style={{ width: `${quotaPercent}%` }} />
                </div>
                <p className="text-[11px] font-semibold text-[var(--k-muted)] font-[family-name:var(--font-karai-mono)] whitespace-nowrap">
                  {quota.used}/{quota.limit} hoy
                </p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              title={email}
              className="bg-[var(--k-card)] border border-[var(--k-border-strong)] hover:border-[var(--k-border-hover)] text-[var(--k-muted)] hover:text-[var(--k-text)] rounded-[10px] py-2 px-3.5 text-xs font-semibold transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto px-[22px] py-[26px]">
          <div className="max-w-[720px] mx-auto flex flex-col gap-[22px]">
            {messages.map((m, i) => {
              const isLastAssistant = m.role === 'assistant' && i === messages.length - 1
              const isEmpty = m.role === 'assistant' && m.content === ''
              return (
                <div key={i}>
                  {m.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[78%] bg-[var(--k-user-bubble)] border border-[var(--k-user-border)] rounded-[16px_16px_4px_16px] px-[15px] py-[11px]">
                        <p className="text-sm leading-[1.55] font-medium text-[var(--k-text-soft)] whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-start">
                      <Image src="/karai-avatar.png" alt="" width={30} height={30} className="rounded-[10px] shrink-0 block mt-0.5" />
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        {isEmpty && loading ? (
                          <div className="flex gap-1.5 items-center h-[30px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--k-muted)] animate-pulse" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--k-muted)] animate-pulse [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--k-muted)] animate-pulse [animation-delay:300ms]" />
                          </div>
                        ) : (
                          <div className="text-[14.5px] leading-[1.6] text-[var(--k-text-soft)]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{m.content}</ReactMarkdown>
                          </div>
                        )}

                        {!isEmpty && (!loading || !isLastAssistant) && (
                          <div className="flex items-center gap-3.5">
                            <button onClick={() => handleCopy(i, m.content)} className="text-[var(--k-muted-2)] hover:text-[var(--k-text)] text-xs font-semibold transition-colors">
                              {copiedIndex === i ? 'Copiado' : 'Copiar'}
                            </button>
                            {isLastAssistant && (
                              <button onClick={handleRegenerate} className="text-[var(--k-muted-2)] hover:text-[var(--k-text)] text-xs font-semibold transition-colors">
                                Regenerar
                              </button>
                            )}
                            <button
                              onClick={() => handleNotifyInterest(i)}
                              disabled={notifiedIndex === i}
                              className="text-[var(--k-muted-2)] hover:text-[var(--k-lime)] text-xs font-semibold transition-colors disabled:text-[var(--k-lime)]"
                            >
                              {notifiedIndex === i ? 'Le avisamos a Agroconecta ✓' : 'Avisar a Agroconecta'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {isFreshConversation && !loading && (
              <div className="flex flex-wrap gap-[7px] pl-[42px]">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="bg-[var(--k-card)] border border-[var(--k-border-strong)] hover:border-[var(--k-lime)] hover:text-[var(--k-text)] text-[var(--k-muted)] rounded-full py-[7px] px-[13px] text-[12.5px] font-semibold transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-[var(--k-negative)]/10 border border-[var(--k-negative)]/30 px-4 py-3 text-sm text-[var(--k-negative)] max-w-[85%]">
                {error}
              </div>
            )}
            <div ref={bottomRef} className="h-0.5" />
          </div>
        </main>

        <div className="shrink-0 px-[22px] pt-2.5 pb-5">
          <form onSubmit={handleSend} className="max-w-[720px] mx-auto">
            <div className="bg-[var(--k-card)] border border-[var(--k-border-strong)] hover:border-[var(--k-border-hover)] rounded-[18px] py-1.5 pl-4 pr-1.5 flex items-center gap-2.5 transition-colors">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribile a Karai — precios, clima, tus lotes…"
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[var(--k-text)] text-[14.5px] font-medium py-2.5 placeholder:text-[var(--k-muted-3)]"
                disabled={loading}
              />
              {loading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="shrink-0 h-[38px] px-3.5 rounded-[13px] bg-[#111C31] border border-[var(--k-border-strong)] text-[var(--k-muted)] text-xs font-semibold"
                >
                  Detener
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="shrink-0 w-[38px] h-[38px] rounded-[13px] bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] border-none text-[#0A1424] text-base font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  ↑
                </button>
              )}
            </div>
            <p className="mt-[9px] text-center text-[11px] font-medium text-[var(--k-muted-4)]">
              Karai puede equivocarse. Verificá precios y fechas antes de decidir.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
