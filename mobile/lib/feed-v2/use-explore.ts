import { useCallback, useMemo, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { fetchExploreCatalog } from './api'
import { filterExplore } from './explore-filter'
import type { ExploreFilters, FeedContentItem, FeedContentType, TrendingTag } from './types'
import { useItemActions, type ItemUpdater } from './use-item-actions'

const EMPTY: ExploreFilters = { query: '', type: null, rubro: null }
// Al volver a Explorar se recarga el catálogo si pasó este tiempo (lo nuevo del feed aparece acá también).
const STALE_MS = 5 * 60_000

export type ExploreStatus = 'idle' | 'loading' | 'ready' | 'error'

// Explorar (README §3.3). Se baja el catálogo entero una vez y búsqueda, rubro y categoría filtran en el
// teléfono: el resultado es instantáneo y no salta de unas opciones a otras mientras responde el servidor.
// Búsqueda, rubro y categoría se excluyen entre sí, como en el prototipo: elegir uno limpia los otros.
export function useExplore() {
  const [filters, setFilters] = useState<ExploreFilters>(EMPTY)
  const [catalog, setCatalog] = useState<FeedContentItem[]>([])
  const [trending, setTrending] = useState<TrendingTag[]>([])
  const [status, setStatus] = useState<ExploreStatus>('idle')
  const loadedAt = useRef(0)
  const loading = useRef(false)

  const active = filters.query.trim().length > 0 || filters.type !== null || filters.rubro !== null

  const load = useCallback(async () => {
    if (loading.current) return
    loading.current = true
    // Si ya hay catálogo se recarga por detrás, sin volver a mostrar "cargando".
    setStatus((s) => (loadedAt.current ? s : 'loading'))
    try {
      const page = await fetchExploreCatalog()
      setCatalog(page.items)
      if (page.trending.length > 0) setTrending(page.trending)
      loadedAt.current = Date.now()
      setStatus('ready')
    } catch {
      if (!loadedAt.current) setStatus('error')
    } finally {
      loading.current = false
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - loadedAt.current > STALE_MS) void load()
    }, [load]),
  )

  const results = useMemo(() => filterExplore(catalog, filters), [catalog, filters])

  const setQuery = useCallback((query: string) => setFilters({ ...EMPTY, query }), [])
  const toggleRubro = useCallback((rubro: string) => setFilters((f) => ({ ...EMPTY, rubro: f.rubro === rubro ? null : rubro })), [])
  const pickType = useCallback((type: FeedContentType) => setFilters({ ...EMPTY, type }), [])
  const reset = useCallback(() => setFilters(EMPTY), [])
  const retry = useCallback(() => void load(), [load])

  const update = useCallback<ItemUpdater>((fn) => setCatalog((prev) => prev.map(fn)), [])
  const { actions, detailKey, closeDetail } = useItemActions(update)
  const detailItem = detailKey ? catalog.find((i) => i.key === detailKey) ?? null : null

  return { filters, active, results, trending, status, setQuery, toggleRubro, pickType, reset, retry, actions, detailItem, closeDetail }
}
