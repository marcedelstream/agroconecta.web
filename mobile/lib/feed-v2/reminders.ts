import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { supabase } from '@/lib/supabase'
import { currentUserId } from './api'
import { registerPushToken } from '@/lib/push-notifications'
import type { FeedContentItem } from './types'

// Recordatorios de eventos y remates: fila en `reminders`. El aviso "En 1 hora: …" lo manda el servidor
// (supabase/fix-v2-reminder-push.sql), así llega aunque se cambie de teléfono. Acá solo se pide el
// permiso y se asegura que el teléfono tenga su token de push registrado.

const REMIND_BEFORE_MS = 60 * 60 * 1000
// Versiones anteriores programaban una notificación local: se guarda su id para cancelarla y no
// duplicar el aviso que ahora manda el servidor.
const LOCAL_IDS_KEY = '@agroconecta:v2-reminder-ids'

export type ReminderResult = 'on' | 'off' | 'denied' | 'error'

export function canRemind(item: FeedContentItem): boolean {
  if (!item.startsAt || (item.contentType !== 'evento' && item.contentType !== 'remate')) return false
  return new Date(item.startsAt).getTime() > Date.now()
}

async function readLocalIds(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_IDS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

async function writeLocalIds(ids: Record<string, string>) {
  await AsyncStorage.setItem(LOCAL_IDS_KEY, JSON.stringify(ids)).catch(() => null)
}

export async function fetchReminderEnabled(item: FeedContentItem): Promise<boolean> {
  const userId = await currentUserId()
  if (!userId) return false
  const { data } = await supabase
    .from('reminders')
    .select('enabled')
    .eq('user_id', userId)
    .eq('source', item.source)
    .eq('source_id', item.sourceId)
    .maybeSingle()
  return (data as { enabled: boolean } | null)?.enabled ?? false
}

export async function setReminder(item: FeedContentItem, on: boolean): Promise<ReminderResult> {
  const userId = await currentUserId()
  if (!userId || !item.startsAt) return 'error'
  const remindAt = new Date(new Date(item.startsAt).getTime() - REMIND_BEFORE_MS)
  const ids = await readLocalIds()

  if (on) {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return 'denied'
    await registerPushToken(userId).catch(() => null)
  }
  if (ids[item.key]) {
    await Notifications.cancelScheduledNotificationAsync(ids[item.key]).catch(() => null)
    delete ids[item.key]
    await writeLocalIds(ids)
  }

  const { error } = await supabase.from('reminders').upsert(
    {
      user_id: userId,
      source: item.source,
      source_id: item.sourceId,
      title: item.title,
      remind_at: remindAt.toISOString(),
      enabled: on,
      // Reactivarlo con otra fecha vuelve a habilitar el envío.
      sent_at: null,
    },
    { onConflict: 'user_id,source,source_id' },
  )
  if (error) return 'error'
  return on ? 'on' : 'off'
}
