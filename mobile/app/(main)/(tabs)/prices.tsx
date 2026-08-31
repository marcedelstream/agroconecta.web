import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
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
// Mismo logo (variante para fondos claros) que usa el widget "Tu mercado hoy" de Inicio —
// se incluye dentro del área capturada para que quede pegado en el PNG que se comparte.
const logo = require('@/assets/images/logo-light.png')

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
  const [search, setSearch] = useState('')
  const [sharing, setSharing] = useState(false)
  const shareCardRef = useRef<View>(null)

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

  const list = useMemo(() => {
    const byTab = prices.filter((p) => p.kind === tab)
    const q = search.trim().toLowerCase()
    if (!q) return byTab
    return byTab.filter((p) => p.label.toLowerCase().includes(q) || p.market.toLowerCase().includes(q))
  }, [prices, tab, search])
  const featured = useMemo(() => prices.find((p) => p.kind === 'cattle'), [prices])

  const latestUpdate = useMemo(() => {
    if (prices.length === 0) return null
    return prices.reduce((latest, p) => (p.updatedAt > latest ? p.updatedAt : latest), prices[0].updatedAt)
  }, [prices])

  // Solo la fuente base (ej. "Valor Agro"), sin la variante completa de cada mercado
  // ("Ganado a frigorífico", "max/min", etc.) — esa lista completa hacía un pie gigante.
  const shareSource = useMemo(
    () => Array.from(new Set(list.map((p) => p.market.split(' - ')[0].trim()))).join(' y '),
    [list]
  )
  const shareTitle = tab === 'cattle' ? 'Precios de Ganado' : 'Precios Internacionales'

  async function handleShare() {
    if (!shareCardRef.current || sharing) return
    setSharing(true)
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir precios de hoy' })
      }
    } catch {
      // Silencioso: si falla la captura o el share, no bloqueamos la UI.
    } finally {
      setSharing(false)
    }
  }

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
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShare} hitSlop={10} disabled={sharing || list.length === 0}>
                {sharing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <HeaderAvatar name={user?.name} />
            </View>
          </View>
          <Text family="noto-sans" size={12} color={R.header.mutedText} style={styles.updatedLabel}>
            {latestUpdate
              ? `Actualizado hoy ${latestUpdate.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`
              : 'Sin actualizaciones'}
          </Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={17} color={R.header.placeholder} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar precios"
              placeholderTextColor={R.header.placeholder}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Fuera de pantalla, solo para la captura de "Compartir" — mismo patrón que el
          widget "Tu mercado hoy" de Inicio (PriceBoard), pero con la lista completa de la
          categoría activa en vez de estar limitado a 3 ítems. */}
      {list.length > 0 && (
        <View style={styles.shareOffscreen} pointerEvents="none">
          <View ref={shareCardRef} collapsable={false} style={styles.shareCard}>
            <View style={styles.shareHeader}>
              <Image source={logo} style={styles.shareLogo} resizeMode="contain" />
              <Text family="noto-sans" weight="bold" size={17} color={R.foreground} style={styles.shareTitle}>
                {shareTitle}
              </Text>
            </View>
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
            <View style={styles.shareFooterRow}>
              <Text family="noto-sans" size={10.5} color={R.mutedForeground2} style={styles.shareFooterText}>
                {latestUpdate
                  ? `${latestUpdate.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })}, ${latestUpdate.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Hoy'}
                {shareSource ? ` · ${shareSource}` : ''}
              </Text>
            </View>
          </View>
        </View>
      )}

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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  updatedLabel: { marginTop: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.header.chip,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 13.5, color: '#FFFFFF', padding: 0 },
  shareOffscreen: { position: 'absolute', top: -9999, left: 0, width: '100%' },
  shareCard: { backgroundColor: R.surface, borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  shareHeader: { alignItems: 'center', marginBottom: 16 },
  shareLogo: { width: 168, height: 38, marginBottom: 10 },
  shareTitle: { textAlign: 'center' },
  shareFooterRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: R.divider },
  shareFooterText: { textAlign: 'center' },
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
