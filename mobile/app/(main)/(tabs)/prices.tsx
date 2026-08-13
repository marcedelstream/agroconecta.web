import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { goBack } from '@/lib/navigation'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { HeaderAvatar } from '@/components/navigation/HeaderAvatar'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { fetchMarketPrices } from '@/lib/supabase-repositories'
import { useApp } from '@/lib/app-context'
import type { MarketPrice, MarketPriceKind } from '@/lib/types'

const R = Colors.redesign

const TABS: { value: MarketPriceKind; label: string }[] = [
  { value: 'cattle', label: 'Ganado' },
  { value: 'international', label: 'Internacional' },
]

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

export default function PricesScreen() {
  const { user } = useApp()
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<MarketPriceKind>('cattle')

  const loadPrices = useCallback(async () => {
    try {
      const data = await fetchMarketPrices()
      setPrices(data)
    } catch {
      setPrices([])
    }
  }, [])

  useEffect(() => {
    let mounted = true
    loadPrices().finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [loadPrices])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadPrices()
    setRefreshing(false)
  }, [loadPrices])

  const list = useMemo(() => prices.filter((p) => p.kind === tab), [prices, tab])
  const featured = useMemo(() => prices.find((p) => p.kind === 'cattle'), [prices])

  const latestUpdate = useMemo(() => {
    if (prices.length === 0) return null
    return prices.reduce((latest, p) => (p.updatedAt > latest ? p.updatedAt : latest), prices[0].updatedAt)
  }, [prices])

  if (!user) return null

  return (
    <View style={[styles.root, { backgroundColor: R.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text family="noto-sans" weight="bold" size={18} color="#FFFFFF">Mercado</Text>
            </View>
            <HeaderAvatar name={user.name} />
          </View>
          <Text family="noto-sans" size={12} color={R.header.mutedText} style={styles.updatedLabel}>
            {latestUpdate
              ? `Actualizado hoy ${latestUpdate.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`
              : 'Sin actualizaciones'}
          </Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      ) : prices.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="trending-up-outline" size={48} color={Colors.lime} />
          </View>
          <Text family="noto-sans" weight="bold" size={18} color={R.foreground} style={{ textAlign: 'center' }}>
            Próximamente
          </Text>
          <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyDesc}>
            Pronto tendrás información actualizada de precios ganaderos y commodities directamente en la plataforma.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />}
        >
          {featured && (
            <View style={styles.featuredBand}>
              <Text family="noto-sans" weight="medium" size={10.5} color={R.mutedForeground2} style={styles.featuredEyebrow}>
                DESTACADO · {featured.unit}
              </Text>
              <View style={styles.featuredRow}>
                <View>
                  <Text family="noto-sans" weight="semibold" size={14} color={R.foreground}>{featured.label}</Text>
                  <Text family="noto-sans" weight="extrabold" size={26} color={R.foreground} style={styles.featuredValue}>
                    {formatValue(featured)}
                  </Text>
                </View>
                <Text family="noto-sans" weight="bold" size={13} color={featured.changePercent >= 0 ? R.positive : R.negative}>
                  {formatDelta(featured)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.tabsRow}>
            {TABS.map((t) => {
              const active = tab === t.value
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.tab, { backgroundColor: active ? R.foreground : R.surface }]}
                  onPress={() => setTab(t.value)}
                  activeOpacity={0.85}
                >
                  <Text family="noto-sans" weight="semibold" size={12} color={active ? '#FFFFFF' : R.foreground}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {list.length > 0 ? (
            <View style={styles.listCard}>
              {list.map((price, i) => {
                const isUp = price.changePercent >= 0
                return (
                  <View key={price.id} style={[styles.row, i < list.length - 1 && styles.rowDivider]}>
                    <Text family="noto-sans" weight="semibold" size={14} color={R.foreground}>{price.label}</Text>
                    <View style={styles.rowRight}>
                      <Text family="noto-sans" weight="bold" size={14} color={R.foreground}>{formatValue(price)}</Text>
                      <Text family="noto-sans" weight="semibold" size={11.5} color={isUp ? R.positive : R.negative} style={styles.rowDelta}>
                        {formatDelta(price)}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyList}>
              Sin precios cargados en esta categoría.
            </Text>
          )}

          <Text family="noto-sans" size={11} lineHeight={16} color={R.mutedForeground2} style={styles.disclaimer}>
            Valores de referencia. No constituyen una cotización oficial.
          </Text>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    backgroundColor: R.header.bg,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  updatedLabel: { marginTop: 6 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    gap: Spacing[4],
    paddingBottom: Spacing[16],
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.lime}15`,
    marginBottom: Spacing[2],
  },
  emptyDesc: { textAlign: 'center', lineHeight: 22 },
  content: { paddingBottom: 26 },
  featuredBand: { backgroundColor: R.surface, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  featuredEyebrow: { letterSpacing: 0.6 },
  featuredRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  featuredValue: { marginTop: 3 },
  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 20 },
  tab: { borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 8 },
  listCard: { backgroundColor: R.surface, borderRadius: 16, marginHorizontal: 20, marginTop: 22, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: R.divider },
  rowRight: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  rowDelta: { width: 56, textAlign: 'right' },
  emptyList: { textAlign: 'center', marginTop: Spacing[8], marginHorizontal: 20 },
  disclaimer: { paddingHorizontal: 20, marginTop: 22 },
})
