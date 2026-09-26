import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Text } from '@/components/ui/Text'
import { DetailSheet } from '@/components/v2/detail/DetailSheet'
import { CategoryGrid } from '@/components/v2/explore/CategoryGrid'
import { ExploreResults } from '@/components/v2/explore/ExploreResults'
import { PricesShortcut } from '@/components/v2/explore/PricesShortcut'
import { RubroChips } from '@/components/v2/explore/RubroChips'
import { TrendingList } from '@/components/v2/explore/TrendingList'
import { LiveRow } from '@/components/v2/live/LiveRow'
import { openLive, useLive } from '@/lib/feed-v2/live'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { SearchField } from '@/components/v2/SearchField'
import { ToastHost } from '@/components/v2/ToastHost'
import { Colors } from '@/constants/colors'
import { CATEGORY_LABEL, EXPLORE_TEXT, RUBROS } from '@/lib/feed-v2/labels'
import { useExplore } from '@/lib/feed-v2/use-explore'
import type { ExploreFilters } from '@/lib/feed-v2/types'

const SIDE = 18

function resultsTitle(f: ExploreFilters): string {
  if (f.query.trim()) return `${EXPLORE_TEXT.resultsFor} “${f.query.trim()}”`
  if (f.type) return CATEGORY_LABEL[f.type]
  return RUBROS.find((r) => r.value === f.rubro)?.label ?? ''
}

// Explorar v2 (README §3.3): buscador, rubros, acceso a Precios, categorías y tendencias; al buscar,
// filtrar o elegir categoría se ve la lista de resultados, que abre la misma ficha que el feed.
export default function ExplorarScreen() {
  const insets = useSafeAreaInsets()
  const bottomSpace = useFloatingTabBarSpace()
  const ex = useExplore()
  const { live, setDismissed } = useLive()

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: bottomSpace + 24 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text family="noto-sans" weight="extrabold" size={32} lineHeight={35} color={Colors.v2.navy} style={styles.h1}>
          {EXPLORE_TEXT.title}
        </Text>
        <SearchField value={ex.filters.query} onChangeText={ex.setQuery} placeholder={EXPLORE_TEXT.search} clearLabel={EXPLORE_TEXT.clearSearch} />
        <RubroChips selected={ex.filters.rubro} onToggle={ex.toggleRubro} side={SIDE} />

        {ex.active ? (
          <ExploreResults
            title={resultsTitle(ex.filters)}
            items={ex.results}
            status={ex.status}
            onOpen={ex.actions.openDetail}
            onClear={ex.reset}
            onRetry={ex.retry}
          />
        ) : (
          <>
            {live.map((l) => (
              <LiveRow key={l.key} item={l} onWatch={() => openLive(l)} onShowHome={() => void setDismissed(l, false)} />
            ))}
            <PricesShortcut />
            <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} style={styles.section}>
              {EXPLORE_TEXT.categories}
            </Text>
            <CategoryGrid onPick={ex.pickType} />
            {ex.trending.length > 0 && (
              <>
                <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} style={styles.section}>
                  {EXPLORE_TEXT.trending}
                </Text>
                <TrendingList trending={ex.trending} onPick={ex.setQuery} />
              </>
            )}
          </>
        )}
      </ScrollView>
      <ToastHost />
      <DetailSheet item={ex.detailItem} actions={ex.actions} onClose={ex.closeDetail} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingHorizontal: SIDE, gap: 20 },
  h1: { letterSpacing: -0.8 },
  section: { letterSpacing: 1, marginBottom: -8 },
})
