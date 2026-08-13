import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { fetchMarketPrices } from '@/lib/supabase-repositories'
import type { MarketPrice } from '@/lib/types'

const R = Colors.redesign

function formatValue(price: MarketPrice) {
  if (price.currency === 'PYG') {
    return `₲ ${Math.round(price.value).toLocaleString('es-PY')}`
  }
  return `$ ${price.value.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDelta(price: MarketPrice) {
  const arrow = price.changePercent >= 0 ? '▲' : '▼'
  return `${arrow} ${Math.abs(price.changePercent).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

export function PriceBoard() {
  const [prices, setPrices] = useState<MarketPrice[]>([])

  useEffect(() => {
    let mounted = true
    fetchMarketPrices()
      .then((data) => { if (mounted) setPrices(data) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const cattle = prices.find((p) => p.kind === 'cattle')
  const international = prices.filter((p) => p.kind === 'international').slice(0, 2)
  const board = [cattle, ...international].filter((p): p is MarketPrice => !!p)

  if (board.length === 0) return null

  const latestUpdate = board.reduce((latest, p) => (p.updatedAt > latest ? p.updatedAt : latest), board[0].updatedAt)
  const markets = Array.from(new Set(board.map((p) => p.market)))
  const updatedLabel = latestUpdate.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text family="noto-sans" weight="bold" size={15} color={R.foreground}>Tu mercado hoy</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/prices' as any)} hitSlop={8}>
          <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
            Ver todos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {board.map((price) => {
          const isUp = price.changePercent >= 0
          return (
            <View key={price.id} style={styles.cell}>
              <Text family="noto-sans" weight="medium" size={10.5} color={R.mutedForeground} numberOfLines={1}>
                {price.label}
              </Text>
              <Text family="noto-sans" weight="bold" size={15} color={R.foreground}>{formatValue(price)}</Text>
              <Text family="noto-sans" weight="semibold" size={10.5} color={isUp ? R.positive : R.negative}>
                {formatDelta(price)}
              </Text>
            </View>
          )
        })}
      </View>

      <Text family="noto-sans" size={10.5} color={R.mutedForeground2} style={styles.updated}>
        Actualizado {updatedLabel} · {markets.join(' y ')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: R.surface, borderRadius: 16, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  underline: { textDecorationLine: 'underline' },
  grid: { flexDirection: 'row', gap: 8 },
  cell: { flex: 1, backgroundColor: R.secondary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 11, gap: 5 },
  updated: { marginTop: 10 },
})
