import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { fetchGuardados } from './api'
import { DETAIL_TEXT } from './labels'
import { setReminder } from './reminders'
import { showToast } from './toast'
import type { FeedContentItem, GuardadosPage } from './types'
import { useItemActions, type ItemUpdater } from './use-item-actions'

type Status = 'loading' | 'ready' | 'error'
const EMPTY: GuardadosPage = { saved: [], reminders: [], activity: [] }

// Se recarga cada vez que se entra a la tab: lo guardado desde el feed tiene que aparecer al volver.
export function useGuardados() {
  const [page, setPage] = useState<GuardadosPage>(EMPTY)
  const [status, setStatus] = useState<Status>('loading')

  const load = useCallback(async () => {
    try {
      setPage(await fetchGuardados())
      setStatus('ready')
    } catch {
      setStatus((s) => (s === 'ready' ? s : 'error'))
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  // Los cambios hechos desde la ficha (me gusta, guardar, seguir) se reflejan en las dos listas.
  const update = useCallback<ItemUpdater>(
    (fn) =>
      setPage((p) => ({
        ...p,
        saved: p.saved.map(fn),
        reminders: p.reminders.map((r) => ({ ...r, item: fn(r.item) })),
      })),
    [],
  )
  const { actions, detailKey, closeDetail } = useItemActions(update)

  const setReminderEnabled = useCallback((key: string, enabled: boolean) => {
    setPage((p) => ({ ...p, reminders: p.reminders.map((r) => (r.item.key === key ? { ...r, enabled } : r)) }))
  }, [])

  const toggleReminder = useCallback(
    async (item: FeedContentItem, enabled: boolean) => {
      Haptics.selectionAsync().catch(() => null)
      setReminderEnabled(item.key, enabled)
      const result = await setReminder(item, enabled)
      if (result === 'denied' || result === 'error') {
        setReminderEnabled(item.key, !enabled)
        showToast(result === 'denied' ? DETAIL_TEXT.toastDenied : DETAIL_TEXT.toastError)
      } else showToast(enabled ? DETAIL_TEXT.toastRemindOn : DETAIL_TEXT.toastRemindOff)
    },
    [setReminderEnabled],
  )

  const all = [...page.saved, ...page.reminders.map((r) => r.item)]
  const detailItem = detailKey ? all.find((i) => i.key === detailKey) ?? null : null

  return { page, status, retry: load, actions, detailItem, closeDetail, toggleReminder }
}
