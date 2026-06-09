import { useEffect, useState } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/card'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { mockMarketPrices } from '@/lib/mock-data'
import { fetchMarketPrices } from '@/lib/supabase-repositories'
import type { CattlePrice, InternationalPrice, MarketPrice } from '@/lib/types'

type Tab = 'ganado' | 'internacional'

function formatPYG(value: number): string {
  return new Intl.NumberFormat('es-PY').format(value)
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function TrendIcon({ change }: { change: number }) {
  const C = useColors()
  if (change > 0) return <Ionicons name="trending-up" size={18} color={Colors.success} />
  if (change < 0) return <Ionicons name="trending-down" size={18} color={Colors.destructive} />
  return <Ionicons name="remove" size={18} color={C.muted} />
}

function ChangeText({ change, percent }: { change: number; percent: number }) {
  const C = useColors()
  const color = change > 0 ? Colors.success : change < 0 ? Colors.destructive : C.muted
  const sign = change > 0 ? '+' : ''
  return (
    <Text variant="caption" style={{ color }}>
      {sign}{percent.toFixed(2)}%
    </Text>
  )
}

export default function PricesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('ganado')
  const [lastUpdate] = useState(new Date())
  const [prices, setPrices] = useState<MarketPrice[]>(mockMarketPrices)
  const C = useColors()

  useEffect(() => {
    let mounted = true
    fetchMarketPrices()
      .then((remotePrices) => {
        if (mounted && remotePrices.length > 0) setPrices(remotePrices)
      })
      .catch(() => {
        if (mounted) setPrices(mockMarketPrices)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="subtitle" weight="bold" family="poppins">Precios</Text>
        <TouchableOpacity style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: C.surface, borderColor: C.border }]}>
        {(['ganado', 'internacional'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { backgroundColor: C.secondary }]}
          >
            <Text
              variant="body"
              weight="semibold"
              style={activeTab === tab ? { color: Colors.lime } : { color: C.muted }}
            >
              {tab === 'ganado' ? 'Ganado' : 'Internacionales'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Last update */}
      <View style={styles.updateRow}>
        <Ionicons name="time-outline" size={13} color={C.muted} />
        <Text variant="caption" color={C.muted}>
          {' '}Actualizado: {lastUpdate.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {activeTab === 'ganado' ? (
        <FlatList
          data={prices.filter((i) => i.kind === 'cattle')}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MarketPriceRow item={item} />}
          ListHeaderComponent={
            <Text variant="caption" color={C.muted} style={styles.listHeader}>
              Precios en Guaraníes (₲) por kilogramo — Mercado Villeta
            </Text>
          }
        />
      ) : (
        <FlatList
          data={prices.filter((i) => i.kind === 'international')}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MarketPriceRow item={item} />}
          ListHeaderComponent={
            <Text variant="caption" color={C.muted} style={styles.listHeader}>
              Commodities agrícolas — Bolsa de Chicago (CBOT)
            </Text>
          }
        />
      )}
    </View>
  )
}

function MarketPriceRow({ item }: { item: MarketPrice }) {
  const isPYG = item.currency === 'PYG'
  return (
    <Card style={styles.row}>
      <View style={styles.rowLeft}>
        <Text variant="body" weight="semibold">{item.label}</Text>
        <Text variant="caption" color={Colors.muted}>{item.market} · {item.unit}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text variant="body" weight="bold" color={Colors.lime}>
          {isPYG ? `₲ ${formatPYG(item.value)}` : `$ ${formatUSD(item.value)}`}
        </Text>
        <View style={styles.changeRow}>
          <TrendIcon change={item.change} />
          <ChangeText change={item.change} percent={item.changePercent} />
        </View>
      </View>
    </Card>
  )
}

function CattleRow({ item }: { item: CattlePrice }) {
  return (
    <Card style={styles.row}>
      <View style={styles.rowLeft}>
        <Text variant="body" weight="semibold">{item.category}</Text>
        <Text variant="caption" color={Colors.muted}>{item.unit}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text variant="body" weight="bold" color={Colors.lime}>
          ₲ {formatPYG(item.pricePerKg)}
        </Text>
        <View style={styles.changeRow}>
          <TrendIcon change={item.change} />
          <ChangeText change={item.change} percent={item.changePercent} />
        </View>
      </View>
    </Card>
  )
}

function InternationalRow({ item }: { item: InternationalPrice }) {
  return (
    <Card style={styles.row}>
      <View style={styles.rowLeft}>
        <Text variant="body" weight="semibold">{item.commodity}</Text>
        <Text variant="caption" color={Colors.muted}>{item.market} · {item.unit}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text variant="body" weight="bold" color={Colors.lime}>
          $ {formatUSD(item.price)}
        </Text>
        <View style={styles.changeRow}>
          <TrendIcon change={item.change} />
          <ChangeText change={item.change} percent={item.changePercent} />
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] },
  refreshBtn: { padding: Spacing[1] },
  tabBar: { flexDirection: 'row', marginHorizontal: Spacing[5], borderRadius: Radius.base, padding: Spacing[1], marginBottom: Spacing[2], borderWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing[2.5], borderRadius: Radius.md },
  updateRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[5], marginBottom: Spacing[3] },
  list: { paddingHorizontal: Spacing[5], gap: Spacing[2.5], paddingBottom: Spacing[6] },
  listHeader: { marginBottom: Spacing[2] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing[4] },
  rowLeft: { gap: Spacing[0.5] },
  rowRight: { alignItems: 'flex-end', gap: Spacing[1] },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
})
