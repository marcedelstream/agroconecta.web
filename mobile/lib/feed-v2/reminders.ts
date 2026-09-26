import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { supabase } from '@/lib/supabase'
import { currentUserId } from './api'
import type { FeedContentItem } from './types'

// Recordatorios de eventos y remates: fila en `reminders` (Guardados → Recordatorios, y base para el
// push del servidor más adelante) + notificación local 1 hora antes (README §3.5).

const REMIND_BEFORE_MS = 60 * 60 * 1000
// id de la notificación local por item, para poder cancelarla al desactivar (vive solo en este equipo).
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
    if (remindAt.getTime() > Date.now()) {
      ids[item.key] = await Notifications.scheduleNotificationAsync({
        content: { title: item.title, body: item.location ?? item.organizationName },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: remindAt },
      })
    }
  } else if (ids[item.key]) {
    await Notifications.cancelScheduledNotificationAsync(ids[item.key]).catch(() => null)
    delete ids[item.key]
  }
  await writeLocalIds(ids)

  const { error } = await supabase.from('reminders').upsert(
    {
      user_id: userId,
      source: item.source,
      source_id: item.sourceId,
      title: item.title,
      remind_at: remindAt.toISOString(),
      enabled: on,
    },
    { onConflict: 'user_id,source,source_id' },
  )
  if (error) return 'error'
  return on ? 'on' : 'off'
}
