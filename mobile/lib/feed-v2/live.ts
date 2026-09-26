import { useCallback, useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { useIsFocused } from '@react-navigation/native'
import { supabase } from '@/lib/supabase'
import { currentUserId, fetchLive } from './api'
import type { LiveItem } from './types'

// Aviso EN VIVO (README §3.1): se consulta al abrir y cada 60 s mientras la pantalla está a la vista.
const POLL_MS = 60_000

export function useLive() {
  const [live, setLive] = useState<LiveItem[]>([])
  const focused = useIsFocused()

  const refresh = useCallback(() => {
    fetchLive().then(setLive).catch(() => null)
  }, [])

  useEffect(() => {
    if (!focused) return
    refresh()
    const t = setInterval(refresh, POLL_MS)
    return () => clearInterval(t)
  }, [focused, refresh])

  // "No me interesa" / X: desaparece de Inicio pero sigue en Explorar. "Mostrar en Inicio" lo vuelve.
  const setDismissed = useCallback(async (item: LiveItem, dismissed: boolean) => {
    setLive((prev) => prev.map((l) => (l.key === item.key ? { ...l, dismissed } : l)))
    const userId = await currentUserId()
    if (!userId) return
    const row = { user_id: userId, kind: 'live', ref_id: item.key }
    const { error } = dismissed
      ? await supabase.from('user_dismissals').upsert(row, { onConflict: 'user_id,kind,ref_id', ignoreDuplicates: true })
      : await supabase.from('user_dismissals').delete().match(row)
    if (error) setLive((prev) => prev.map((l) => (l.key === item.key ? { ...l, dismissed: !dismissed } : l)))
  }, [])

  return { live, refresh, setDismissed }
}

/** Abre la transmisión: el remate en su pantalla de video, el evento en su hub, o el enlace directo. */
export function openLive(item: LiveItem) {
  if (item.source === 'post' && item.sourceId) router.push(`/(main)/video/${item.sourceId}` as never)
  else if (item.source === 'event' && item.sourceId) router.push(`/(main)/event/${item.sourceId}` as never)
  else void Linking.openURL(item.streamUrl)
}
