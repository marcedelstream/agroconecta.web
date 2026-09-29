import { fetch as expoFetch } from 'expo/fetch'
import { supabase } from '@/lib/supabase'
import { WEB_BASE_URL } from './api'
import type { FeedContentItem } from './types'

// Karai en la app: consume la misma API que el chat web (web/app/api/karai/*) con el JWT de Supabase.
// No hay un segundo backend de IA ni API key en la app (BACKEND-Y-DATOS.md §4).

async function authHeaders(): Promise<Record<string, string> | null> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null
}

export type KaraiSendResult =
  | { ok: true; conversationId: string | null; text: string }
  | { ok: false; status: number; error: string }

/**
 * Manda un mensaje y va entregando el texto a medida que llega (`onDelta`). expo/fetch lee el cuerpo
 * como stream en el SDK 55; si el stream no está disponible, se lee la respuesta completa de una vez.
 */
export async function sendKaraiMessage(
  message: string,
  conversationId: string | null,
  onDelta: (fullText: string) => void,
): Promise<KaraiSendResult> {
  const headers = await authHeaders()
  if (!headers) return { ok: false, status: 401, error: '' }

  const res = await expoFetch(`${WEB_BASE_URL}/api/karai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, conversationId }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    return { ok: false, status: res.status, error: body?.error ?? '' }
  }

  const newConversationId = res.headers.get('X-Karai-Conversation-Id')
  let text = ''
  const reader = res.body?.getReader()
  if (reader) {
    const decoder = new TextDecoder()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
      onDelta(text)
    }
  } else {
    text = await res.text()
    onDelta(text)
  }
  return { ok: true, conversationId: newConversationId, text }
}

export async function fetchKaraiRefs(message: string): Promise<FeedContentItem[]> {
  const headers = await authHeaders()
  if (!headers) return []
  try {
    const res = await fetch(`${WEB_BASE_URL}/api/karai/refs`, { method: 'POST', headers, body: JSON.stringify({ message }) })
    if (!res.ok) return []
    const body = (await res.json()) as { refs?: FeedContentItem[] }
    return body.refs ?? []
  } catch {
    return []
  }
}

export async function fetchKaraiQuota(): Promise<{ used: number; limit: number } | null> {
  const headers = await authHeaders()
  if (!headers) return null
  try {
    const res = await fetch(`${WEB_BASE_URL}/api/karai/quota`, { headers })
    return res.ok ? ((await res.json()) as { used: number; limit: number }) : null
  } catch {
    return null
  }
}

export interface KaraiConversation {
  id: string
  preview: string
  lastMessageAt: string
}

/** Historial de conversaciones del usuario (mismo endpoint que el costado del chat web). */
export async function fetchKaraiConversations(): Promise<KaraiConversation[]> {
  const headers = await authHeaders()
  if (!headers) return []
  const res = await fetch(`${WEB_BASE_URL}/api/karai/conversations`, { headers })
  if (!res.ok) throw new Error(`conversations HTTP ${res.status}`)
  const body = (await res.json()) as { conversations: KaraiConversation[] }
  return body.conversations
}

export async function fetchKaraiConversation(id: string): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  const headers = await authHeaders()
  if (!headers) return []
  const res = await fetch(`${WEB_BASE_URL}/api/karai/conversations/${encodeURIComponent(id)}`, { headers })
  if (!res.ok) throw new Error(`conversation HTTP ${res.status}`)
  const body = (await res.json()) as { messages: { role: 'user' | 'assistant'; content: string }[] }
  return body.messages
}

export async function deleteKaraiConversation(id: string): Promise<boolean> {
  const headers = await authHeaders()
  if (!headers) return false
  const res = await fetch(`${WEB_BASE_URL}/api/karai/conversations/${encodeURIComponent(id)}`, { method: 'DELETE', headers }).catch(() => null)
  return !!res?.ok
}
