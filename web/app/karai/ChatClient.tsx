'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: DisplayMessage = {
  role: 'assistant',
  content: 'Mba\'éichapa. Soy Karai, el asistente de Agroconecta. Preguntame por precios, noticias, eventos, o contame de tu finca.',
}

export function KaraiChatClient({ email }: { email: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/karai/login')
    router.refresh()
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
      const supabase = createSupabaseBrowser()
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Sesión expirada, volvé a ingresar.')

      const res = await fetch('/api/karai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: trimmed, conversationId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo enviar el mensaje.')

      setConversationId(data.conversationId)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-bdr px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-foreground">Karai</p>
          <p className="text-muted text-xs">{email}</p>
        </div>
        <button onClick={handleSignOut} className="btn text-xs">Cerrar sesión</button>
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
  )
}
