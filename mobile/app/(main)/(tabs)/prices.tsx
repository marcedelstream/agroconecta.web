import { useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/card'
import { AdBanner } from '@/components/ui/AdBanner'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { fetchMarketPrices } from '@/lib/supabase-repositories'
import type { MarketPrice, MarketPriceKind } from '@/lib/types'

const TABS: { value: MarketPriceKind; label: string }[] = [
  { value: 'cattle', label: 'Ganadería' },
  { value: 'international', label: 'Commodities' },
]

function formatValue(price: MarketPrice) {
  if (price.currency === 'PYG') {
    return `₲ ${Math.round(price.value).toLocaleString('es-PY')}`
  }
  return `$ ${price.value.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PricesScreen() {
  const C = useColors()
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<MarketPriceKind>('cattle')

  useEffect(() => {
    let mounted = true
    fetchMarketPrices()
      .then((data) => { if (mounted) setPrices(data) })
      .catch(() => { if (mounted) setPrices([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const list = useMemo(() => prices.filter((p) => p.kind === tab), [prices, tab])

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.header}>
        <Text variant="subtitle" weight="bold" family="poppins">Precios</Text>
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      ) : prices.length === 0 ? (
        <View style={styles.body}>
          <View style={[styles.iconBox, { backgroundColor: `${Colors.lime}15` }]}>
            <Ionicons name="trending-up-outline" size={48} color={Colors.lime} />
          </View>
          <Text variant="title" weight="bold" family="poppins" style={{ textAlign: 'center' }}>
            Próximamente
          </Text>
          <Text variant="body" color={C.muted} style={styles.desc}>
            Pronto tendrás información actualizada de precios ganaderos y commodities directamente en la plataforma.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const active = tab === t.value
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.tab, { borderColor: active ? Colors.lime : C.border, backgroundColor: active ? Colors.lime : C.surface }]}
                  onPress={() => setTab(t.value)}
                >
                  <Text variant="caption" weight="semibold" style={{ color: active ? '#0A0A13' : C.muted }}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {list.map((price) => {
              const isUp = price.change >= 0
              return (
                <Card key={price.id} style={styles.row} padding={4}>
                  <View style={styles.rowLeft}>
                    <Text variant="body" weight="semibold">{price.label}</Text>
                    <Text variant="caption" color={C.muted}>{price.market} · {price.unit}</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text variant="body" weight="bold" family="poppins">{formatValue(price)}</Text>
                    <View style={styles.changeRow}>
                      <Ionicons name={isUp ? 'caret-up' : 'caret-down'} size={12} color={isUp ? Colors.success : Colors.destructive} />
                      <Text variant="label" style={{ color: isUp ? Colors.success : Colors.destructive }}>
                        {Math.abs(price.changePercent).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </Card>
              )
            })}
            {list.length === 0 && (
              <Text variant="body" color={C.muted} style={{ textAlign: 'center', marginTop: Spacing[8] }}>
                Sin precios cargados en esta categoría.
              </Text>
            )}
            <AdBanner placement="precios" style={styles.adBanner} />
          </ScrollView>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    gap: Spacing[4],
    paddingBottom: Spacing[16],
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  desc: {
    textAlign: 'center',
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
  },
  tab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  list: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10], gap: Spacing[2.5] },
  adBanner: { marginBottom: Spacing[1] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[3] },
  rowLeft: { flex: 1, gap: 2 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
})
