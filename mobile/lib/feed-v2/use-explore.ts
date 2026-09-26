import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchExplore } from './api'
import type { ExploreFilters, FeedContentItem, FeedContentType, TrendingTag } from './types'
import { useItemActions, type ItemUpdater } from './use-item-actions'

// Espera antes de buscar mientras se escribe, para no pedir una búsqueda por letra.
const SEARCH_DEBOUNCE_MS = 350
const EMPTY: ExploreFilters = { query: '', type: null, rubro: null }

export type ExploreStatus = 'idle' | 'loading' | 'ready' | 'error'

// Explorar (README §3.3). Búsqueda, rubro y categoría se excluyen entre sí, como en el prototipo:
// elegir uno limpia los otros.
export function useExplore() {
  const [filters, setFilters] = useState<ExploreFilters>(EMPTY)
  const [results, setResults] = useState<FeedContentItem[]>([])
  const [trending, setTrending] = useState<TrendingTag[]>([])
  const [status, setStatus] = useState<ExploreStatus>('idle')
  const requestId = useRef(0)

  const active = filters.query.trim().length > 0 || filters.type !== null || filters.rubro !== null

  const run = useCallback(async (f: ExploreFilters) => {
    const id = ++requestId.current
    setStatus('loading')
    try {
      const page = await fetchExplore(f)
      // Una respuesta vieja (de lo que se escribía antes) no pisa a la más nueva.
      if (id !== requestId.current) return
      setResults(page.items)
      if (page.trending.length > 0) setTrending(page.trending)
      setStatus('ready')
    } catch {
      if (id === requestId.current) setStatus('error')
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void run(filters), filters.query ? SEARCH_DEBOUNCE_MS : 0)
    return () => clearTimeout(t)
  }, [filters, run])

  const setQuery = useCallback((query: string) => setFilters({ ...EMPTY, query }), [])
  const toggleRubro = useCallback((rubro: string) => setFilters((f) => ({ ...EMPTY, rubro: f.rubro === rubro ? null : rubro })), [])
  const pickType = useCallback((type: FeedContentType) => setFilters({ ...EMPTY, type }), [])
  const reset = useCallback(() => setFilters(EMPTY), [])
  const retry = useCallback(() => void run(filters), [filters, run])

  const update = useCallback<ItemUpdater>((fn) => setResults((prev) => prev.map(fn)), [])
  const { actions, detailKey, closeDetail } = useItemActions(update)
  const detailItem = detailKey ? results.find((i) => i.key === detailKey) ?? null : null

  return { filters, active, results, trending, status, setQuery, toggleRubro, pickType, reset, retry, actions, detailItem, closeDetail }
}
