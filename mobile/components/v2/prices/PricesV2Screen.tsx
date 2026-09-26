import { useMemo, useRef, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import { Text } from '@/components/ui/Text'
import { SearchField } from '@/components/v2/SearchField'
import { SegmentedControl } from '@/components/v2/SegmentedControl'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { FeaturedPriceCard } from '@/components/v2/prices/FeaturedPriceCard'
import { PricesHeader } from '@/components/v2/prices/PricesHeader'
import { PriceList } from '@/components/v2/prices/PriceRows'
import { PriceShareCapture } from '@/components/v2/prices/PriceShareCapture'
import { Colors } from '@/constants/colors'
import { PRICES_TEXT } from '@/lib/feed-v2/labels'
import { goBack } from '@/lib/navigation'
import { useMarketPrices } from '@/lib/use-market-prices'
import type { MarketPriceKind } from '@/lib/types'

const TABS: { value: MarketPriceKind; label: string }[] = [
  { value: 'cattle', label: PRICES_TEXT.cattle },
  { value: 'international', label: PRICES_TEXT.international },
]

// Precios v2 (pantalla clara del rediseño). Se llega desde "Ver todos los precios" del feed.
export function PricesV2Screen() {
  const insets = useSafeAreaInsets()
  const bottomSpace = useFloatingTabBarSpace()
  const { prices, loading, refreshing, refresh, latestUpdate } = useMarketPrices()
  const [tab, setTab] = useState<MarketPriceKind>('cattle')
  const [search, setSearch] = useState('')
  const [sharing, setSharing] = useState(false)
  const shareRef = useRef<View>(null)

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return prices
      .filter((p) => p.kind === tab)
      .filter((p) => !q || p.label.toLowerCase().includes(q) || p.market.toLowerCase().includes(q))
  }, [prices, tab, search])
  const featured = useMemo(() => prices.find((p) => p.kind === 'cattle'), [prices])

  async function share() {
    if (!shareRef.current || sharing) return
    setSharing(true)
    try {
      const uri = await captureRef(shareRef, { format: 'png', quality: 1 })
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: PRICES_TEXT.share })
    } catch {
      // Si falla la captura o el menú de compartir, no se bloquea la pantalla.
    } finally {
      setSharing(false)
    }
  }

  const shareFooter = latestUpdate
    ? latestUpdate.toLocaleString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {list.length > 0 && (
        <PriceShareCapture
          ref={shareRef}
          title={tab === 'cattle' ? PRICES_TEXT.shareCattle : PRICES_TEXT.shareInternational}
          prices={list}
          footer={shareFooter}
        />
      )}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: bottomSpace + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.v2.limeText} />}
      >
        <PricesHeader updated={latestUpdate} sharing={sharing} canShare={list.length > 0} onBack={() => goBack()} onShare={share} />

        {loading ? (
          <ActivityIndicator color={Colors.v2.limeText} style={styles.loading} />
        ) : prices.length === 0 ? (
          <View style={styles.empty}>
            <Text family="noto-sans" weight="bold" size={18} color={Colors.v2.navy}>{PRICES_TEXT.emptyTitle}</Text>
            <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.muted} style={styles.center}>{PRICES_TEXT.emptyBody}</Text>
          </View>
        ) : (
          <>
            {featured && <FeaturedPriceCard price={featured} />}
            <SearchField value={search} onChangeText={setSearch} placeholder={PRICES_TEXT.search} clearLabel={PRICES_TEXT.clearSearch} />
            <SegmentedControl options={TABS} value={tab} onChange={setTab} />
            {list.length > 0 ? (
              <PriceList prices={list} />
            ) : (
              <Text family="noto-sans" size={15} color={Colors.v2.muted} style={styles.center}>{PRICES_TEXT.noResults}</Text>
            )}
            <Text family="noto-sans" size={12} lineHeight={17} color={Colors.v2.muted}>{PRICES_TEXT.disclaimer}</Text>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingHorizontal: 18, gap: 18 },
  loading: { marginTop: 48 },
  empty: { alignItems: 'center', gap: 8, marginTop: 48, paddingHorizontal: 16 },
  center: { textAlign: 'center' },
})
