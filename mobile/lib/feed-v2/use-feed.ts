import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchFeedPage } from './api'
import { getSessionSeenKeys } from './telemetry'
import type { FeedItem } from './types'
import { useItemActions, type ItemUpdater } from './use-item-actions'
import { useApp } from '@/lib/app-context'

type Status = 'loading' | 'ready' | 'error'

// Cuando faltan estos items para el final se pide la página siguiente (BACKEND-Y-DATOS.md §3.4).
export const PREFETCH_THRESHOLD = 3

export function useFeed() {
  const { session } = useApp()
  const signedIn = !!session
  const [items, setItems] = useState<FeedItem[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const cursor = useRef<string | null>(null)
  const hasMore = useRef(true)
  const loadingMore = useRef(false)
  // Se fija al cargar la primera página y se reusa en las siguientes: el orden del servidor depende
  // de esta lista, así que tiene que ser la misma en toda la paginación.
  const seenAtLoad = useRef<string[]>([])

  const loadFirst = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true)
    else setStatus('loading')
    try {
      seenAtLoad.current = getSessionSeenKeys()
      const page = await fetchFeedPage(null, seenAtLoad.current)
      cursor.current = page.nextCursor
      hasMore.current = page.nextCursor !== null
      setItems(signedIn ? page.items : [{ kind: 'welcome', key: 'welcome' }, ...page.items])
      setStatus('ready')
    } catch {
      // En un refresh fallido se conserva lo que ya estaba en pantalla.
      if (!isRefresh) setStatus('error')
    } finally {
      setRefreshing(false)
    }
  }, [signedIn])

  // Al iniciar o cerrar sesión el feed se arma de nuevo (con o sin personalización).
  useEffect(() => {
    void loadFirst(false)
  }, [loadFirst])

  const loadMore = useCallback(async () => {
    if (loadingMore.current || !hasMore.current || !cursor.current) return
    loadingMore.current = true
    try {
      const page = await fetchFeedPage(cursor.current, seenAtLoad.current)
      cursor.current = page.nextCursor
      hasMore.current = page.nextCursor !== null
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.key))
        return [...prev, ...page.items.filter((i) => !seen.has(i.key))]
      })
    } catch {
      // Se reintenta solo en el próximo cambio de item.
    } finally {
      loadingMore.current = false
    }
  }, [])

  const update = useCallback<ItemUpdater>(
    (fn) => setItems((prev) => prev.map((i) => (i.kind === 'content' ? fn(i) : i))),
    [],
  )
  const { actions, detailKey, closeDetail } = useItemActions(update)

  const refresh = useCallback(() => loadFirst(true), [loadFirst])
  const retry = useCallback(() => loadFirst(false), [loadFirst])

  const found = detailKey ? items.find((i) => i.key === detailKey) : undefined
  const detailItem = found?.kind === 'content' ? found : null

  return { items, status, refreshing, refresh, retry, loadMore, actions, detailItem, closeDetail }
}

export type FeedController = ReturnType<typeof useFeed>
export type { FeedActions } from './use-item-actions'
