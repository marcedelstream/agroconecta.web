'server-only'

import { createSupabaseAdmin } from './supabase-admin'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export type NotificationCategory = 'breakingNews' | 'priceAlerts' | 'weatherAlerts' | 'institutionalUpdates'

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

export async function sendPushToAll(payload: PushPayload, category?: NotificationCategory): Promise<void> {
  const supabase = createSupabaseAdmin()

  const { data: rows } = await supabase
    .from('push_tokens')
    .select('user_id, expo_token')
    .eq('enabled', true)

  if (!rows?.length) return

  let recipients = rows
    .filter((r) => r.expo_token)
    .map((r) => ({ userId: r.user_id as string, token: r.expo_token as string }))

  if (category) {
    const userIds = [...new Set(recipients.map((r) => r.userId))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, notification_prefs')
      .in('id', userIds)

    const prefsByUser = new Map(
      (profiles ?? []).map((p) => [p.id as string, p.notification_prefs as Record<string, boolean> | null])
    )

    recipients = recipients.filter((r) => {
      const prefs = prefsByUser.get(r.userId)
      // Sin perfil sincronizado todavía (o sin ese campo) -> se asume opt-in, mismo default que la app
      if (!prefs) return true
      return prefs[category] !== false
    })
  }

  const tokens = recipients.map((r) => r.token)

  for (let i = 0; i < tokens.length; i += 100) {
    await sendBatch(tokens.slice(i, i + 100), payload)
  }
}
