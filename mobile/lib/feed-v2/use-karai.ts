import { useCallback, useEffect, useRef, useState } from 'react'
import { KARAI_TEXT } from './labels'
import { fetchKaraiQuota, fetchKaraiRefs, sendKaraiMessage } from './karai'
import type { FeedContentItem } from './types'

export interface KaraiMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  refs: FeedContentItem[]
  /** Respuesta de error/aviso del servidor (sin cuota, solo miembros), no una respuesta de la IA. */
  notice?: 'error' | 'members'
}

let seq = 0
const nextId = () => `m${++seq}`

export function useKarai() {
  const [messages, setMessages] = useState<KaraiMessage[]>([])
  const [typing, setTyping] = useState(false)
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null)
  const conversationId = useRef<string | null>(null)

  const refreshQuota = useCallback(() => {
    fetchKaraiQuota().then(setQuota).catch(() => null)
  }, [])
  useEffect(refreshQuota, [refreshQuota])

  const patch = (id: string, change: Partial<KaraiMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...change } : m)))

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || typing) return
      const botId = nextId()
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text, refs: [] }])
      setTyping(true)
      // Las tarjetas de contenido se buscan en paralelo a la respuesta (no gastan IA).
      const refsPromise = fetchKaraiRefs(text)
      let started = false
      try {
        const result = await sendKaraiMessage(text, conversationId.current, (full) => {
          if (!started) {
            started = true
            setTyping(false)
            setMessages((prev) => [...prev, { id: botId, role: 'assistant', text: full, refs: [] }])
          } else patch(botId, { text: full })
        })
        if (result.ok) {
          conversationId.current = result.conversationId ?? conversationId.current
          const refs = await refsPromise
          if (started) patch(botId, { refs })
          else setMessages((prev) => [...prev, { id: botId, role: 'assistant', text: result.text, refs }])
        } else {
          const notice = result.status === 402 ? 'members' : 'error'
          setMessages((prev) => [...prev, { id: botId, role: 'assistant', text: result.error || KARAI_TEXT.error, refs: [], notice }])
        }
      } catch {
        setMessages((prev) => [...prev.filter((m) => m.id !== botId), { id: botId, role: 'assistant', text: KARAI_TEXT.error, refs: [], notice: 'error' }])
      } finally {
        setTyping(false)
        refreshQuota()
      }
    },
    [typing, refreshQuota],
  )

  const reset = useCallback(() => {
    conversationId.current = null
    setMessages([])
  }, [])

  return { messages, typing, quota, send, reset }
}
