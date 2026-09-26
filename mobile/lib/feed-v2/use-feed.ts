import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from 'expo-haptics'
import { fetchFeedPage } from './api'
import { setFollowing, setLiked, setSaved, shareItem } from './actions'
import { trackFeedEvent } from './telemetry'
import type { FeedContentItem, FeedItem } from './types'

type Status = 'loading' | 'ready' | 'error'

// Cuando faltan estos items para el final se pide la página siguiente (BACKEND-Y-DATOS.md §3.4).
export const PREFETCH_THRESHOLD = 3

export function useFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const cursor = useRef<string | null>(null)
  const hasMore = useRef(true)
  const loadingMore = useRef(false)

  const loadFirst = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true)
    else setStatus('loading')
    try {
      const page = await fetchFeedPage(null)
      cursor.current = page.nextCursor
      hasMore.current = page.nextCursor !== null
      setItems(page.items)
      setStatus('ready')
    } catch {
      // En un refresh fallido se conserva lo que ya estaba en pantalla.
      if (!isRefresh) setStatus('error')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadFirst(false)
  }, [loadFirst])

  const loadMore = useCallback(async () => {
    if (loadingMore.current || !hasMore.current || !cursor.current) return
    loadingMore.current = true
    try {
      const page = await fetchFeedPage(cursor.current)
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

  const patch = useCallback((key: string, change: Partial<FeedContentItem>) => {
    setItems((prev) => prev.map((i) => (i.kind === 'content' && i.key === key ? { ...i, ...change } : i)))
  }, [])

  // Optimista: se pinta ya y se revierte si la escritura en Supabase falla.
  const toggleLike = useCallback(
    async (item: FeedContentItem) => {
      const on = !item.liked
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null)
      patch(item.key, { liked: on, likes: item.likes + (on ? 1 : -1) })
      if (await setLiked(item, on)) {
        if (on) trackFeedEvent(item.source, item.sourceId, 'like')
      } else patch(item.key, { liked: item.liked, likes: item.likes })
    },
    [patch],
  )

  const toggleSave = useCallback(
    async (item: FeedContentItem) => {
      const on = !item.saved
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null)
      patch(item.key, { saved: on, saves: item.saves + (on ? 1 : -1) })
      if (await setSaved(item, on)) {
        if (on) trackFeedEvent(item.source, item.sourceId, 'save')
      } else patch(item.key, { saved: item.saved, saves: item.saves })
    },
    [patch],
  )

  // Seguir afecta a todos los items de la misma organización, no solo al visible.
  const toggleFollow = useCallback(async (item: FeedContentItem) => {
    const on = !item.following
    const orgId = item.organizationId
    const apply = (value: boolean) =>
      setItems((prev) =>
        prev.map((i) => (i.kind === 'content' && i.organizationId === orgId ? { ...i, following: value } : i)),
      )
    Haptics.selectionAsync().catch(() => null)
    apply(on)
    if (await setFollowing(item, on)) {
      if (on) trackFeedEvent(item.source, item.sourceId, 'follow')
    } else apply(item.following)
  }, [])

  const share = useCallback(async (item: FeedContentItem) => {
    if (await shareItem(item)) trackFeedEvent(item.source, item.sourceId, 'share')
  }, [])

  // Objeto estable: los slides son memo y no tienen que re-renderizarse cuando cambia otro item.
  const actions = useMemo(() => ({ toggleLike, toggleSave, toggleFollow, share }), [toggleLike, toggleSave, toggleFollow, share])
  const refresh = useCallback(() => loadFirst(true), [loadFirst])
  const retry = useCallback(() => loadFirst(false), [loadFirst])

  return { items, status, refreshing, refresh, retry, loadMore, actions }
}

export type FeedController = ReturnType<typeof useFeed>
export type FeedActions = FeedController['actions']
