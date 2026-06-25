'server-only'

import { createSupabaseAdmin } from './supabase-admin'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export interface PushPayload {
  title: string
  body: string
  data?: Record<string, string>
}

interface ExpoMessage {
  to: string
  title: string
  body: string
  data: Record<string, string>
  channelId: string
  sound: 'default'
  priority: 'high'
}

async function sendBatch(tokens: string[], payload: PushPayload): Promise<void> {
  const messages: ExpoMessage[] = tokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    channelId: 'important-posts',
    sound: 'default',
    priority: 'high',
  }))

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(messages),
  })
}

export async function sendPushToAll(payload: PushPayload): Promise<void> {
  const supabase = createSupabaseAdmin()

  const { data: rows } = await supabase
    .from('push_tokens')
    .select('expo_token')
    .eq('enabled', true)

  if (!rows?.length) return

  const tokens = rows.map((r) => r.expo_token as string).filter(Boolean)

  for (let i = 0; i < tokens.length; i += 100) {
    await sendBatch(tokens.slice(i, i + 100), payload)
  }
}
