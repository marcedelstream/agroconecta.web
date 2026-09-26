import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMarketPrices } from './supabase-repositories'
import type { MarketPrice } from './types'

export function useMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setPrices(await fetchMarketPrices())
    } catch {
      setPrices([])
    }
  }, [])

  useEffect(() => {
    let mounted = true
    load().finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [load])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const latestUpdate = useMemo(
    () => (prices.length === 0 ? null : prices.reduce((acc, p) => (p.updatedAt > acc ? p.updatedAt : acc), prices[0].updatedAt)),
    [prices],
  )

  return { prices, loading, refreshing, refresh, latestUpdate }
}
