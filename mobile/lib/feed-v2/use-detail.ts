import { useCallback, useEffect, useState } from 'react'
import * as Haptics from 'expo-haptics'
import { loadFeedDetail, type FeedDetail } from './detail'
import { DETAIL_TEXT } from './labels'
import { canRemind, fetchReminderEnabled, setReminder } from './reminders'
import { showToast } from './toast'
import type { FeedContentItem } from './types'

const REMINDER_TOAST = {
  on: DETAIL_TEXT.toastRemindOn,
  off: DETAIL_TEXT.toastRemindOff,
  denied: DETAIL_TEXT.toastDenied,
  error: DETAIL_TEXT.toastError,
} as const

export function useFeedDetail(item: FeedContentItem | null) {
  const [detail, setDetail] = useState<FeedDetail | null>(null)
  const [reminderOn, setReminderOn] = useState(false)
  const key = item?.key ?? null

  useEffect(() => {
    setDetail(null)
    setReminderOn(false)
    if (!item) return
    let alive = true
    loadFeedDetail(item)
      .then((d) => alive && setDetail(d))
      // Sin detalle remoto la ficha igual muestra lo que ya trae el item (título, bajada, fecha).
      .catch(() => alive && setDetail({ bodyHtml: null, bodyText: item.summary, when: null, place: item.location, secondaryLink: null }))
    if (canRemind(item)) fetchReminderEnabled(item).then((on) => alive && setReminderOn(on)).catch(() => null)
    return () => {
      alive = false
    }
    // Solo cuando cambia de item, no en cada me gusta/guardar del mismo item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const toggleReminder = useCallback(async () => {
    if (!item) return
    const next = !reminderOn
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null)
    setReminderOn(next)
    const result = await setReminder(item, next)
    if (result === 'denied' || result === 'error') setReminderOn(!next)
    showToast(REMINDER_TOAST[result])
  }, [item, reminderOn])

  return { detail, reminderOn, toggleReminder }
}
