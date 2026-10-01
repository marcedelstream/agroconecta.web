import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Text } from '@/components/ui/Text'
import { DetailSheet } from '@/components/v2/detail/DetailSheet'
import { CategoryGrid } from '@/components/v2/explore/CategoryGrid'
import { ContactCard } from '@/components/v2/ContactCard'
import { ServicesRow } from '@/components/v2/explore/ServicesRow'
import { ExploreResults } from '@/components/v2/explore/ExploreResults'
import { PricesShortcut } from '@/components/v2/explore/PricesShortcut'
import { RubroChips } from '@/components/v2/explore/RubroChips'
import { TrendingList } from '@/components/v2/explore/TrendingList'
import { HomeBlock } from '@/components/v2/home/HomeBlock'
import { HomeGreeting } from '@/components/v2/home/HomeGreeting'
import { SectionOrderSheetV2 } from '@/components/v2/home/SectionOrderSheetV2'
import { LiveRow } from '@/components/v2/live/LiveRow'
import { openLive, useLive } from '@/lib/feed-v2/live'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { SearchField } from '@/components/v2/SearchField'
import { ToastHost } from '@/components/v2/ToastHost'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { normalizeHomeOrder, type HomeBlockKey } from '@/lib/feed-v2/home-sections'
import { CATEGORY_LABEL, EXPLORE_TEXT, HOME_TEXT, RUBROS, SERVICE_TEXT } from '@/lib/feed-v2/labels'
import { useExplore } from '@/lib/feed-v2/use-explore'
import type { ExploreFilters, FeedContentItem, FeedContentType } from '@/lib/feed-v2/types'

const SIDE = 18
const BLOCK_SIZE = 8

function resultsTitle(f: ExploreFilters): string {
  if (f.query.trim()) return `${EXPLORE_TEXT.resultsFor} “${f.query.trim()}”`
  if (f.type) return CATEGORY_LABEL[f.type]
  return RUBROS.find((r) => r.value === f.rubro)?.label ?? ''
}

const ofTypes = (items: FeedContentItem[], types: FeedContentType[]) => items.filter((i) => types.includes(i.contentType))
const byStart = (items: FeedContentItem[]) => [...items].sort((a, b) => (a.startsAt ?? '9999').localeCompare(b.startsAt ?? '9999'))

// Inicio v2 (pedido de Marle, 2026-09-30): lo que antes era Explorar, con cosas de la v1 — saludo,
// "Ordenar intereses" y bloques de noticias y eventos. El feed vertical pasó a la pestaña Explorar.
// Buscar o elegir un rubro o categoría muestra la lista de resultados en lugar de los bloques.
export default function InicioScreen() {
  const insets = useSafeAreaInsets()
  const bottomSpace = useFloatingTabBarSpace()
  const ex = useExplore()
  const { live, setDismissed } = useLive()
  const { user, updateUser } = useApp()
  const [ordering, setOrdering] = useState(false)
  const order = normalizeHomeOrder(user?.sectionOrder)

  // El catálogo ya viene ordenado para el usuario (mismo ranking que el feed).
  const blocks = useMemo(
    () => ({
      news: ofTypes(ex.catalog, ['noticia', 'video']).slice(0, BLOCK_SIZE),
      agenda: byStart(ofTypes(ex.catalog, ['evento', 'remate'])).slice(0, BLOCK_SIZE),
      learn: ofTypes(ex.catalog, ['curso', 'empleo']).slice(0, BLOCK_SIZE),
      library: ofTypes(ex.catalog, ['libro']).slice(0, BLOCK_SIZE),
    }),
    [ex.catalog],
  )

  const sectionTitle = (text: string) => (
    <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} style={styles.section}>{text}</Text>
  )

  function renderBlock(key: HomeBlockKey) {
    switch (key) {
      case 'market':
        return <PricesShortcut key={key} />
      case 'live':
        return live.length > 0 ? (
          <View key={key} style={styles.stack}>
            {live.map((l) => (
              <LiveRow key={l.key} item={l} onWatch={() => openLive(l)} onShowHome={() => void setDismissed(l, false)} />
            ))}
          </View>
        ) : null
      case 'news':
        return <HomeBlock key={key} title={HOME_TEXT.news} items={blocks.news} onOpen={ex.actions.openDetail} onSeeAll={() => ex.pickType('noticia')} side={SIDE} />
      case 'agenda':
        return <HomeBlock key={key} title={HOME_TEXT.agenda} items={blocks.agenda} onOpen={ex.actions.openDetail} onSeeAll={() => ex.pickType('evento')} side={SIDE} />
      case 'learn':
        return <HomeBlock key={key} title={HOME_TEXT.learn} items={blocks.learn} onOpen={ex.actions.openDetail} onSeeAll={() => ex.pickType('curso')} side={SIDE} />
      case 'library':
        return <HomeBlock key={key} title={HOME_TEXT.library} items={blocks.library} onOpen={ex.actions.openDetail} onSeeAll={() => ex.pickType('libro')} side={SIDE} />
      case 'categories':
        return (
          <View key={key} style={styles.stack}>
            {sectionTitle(EXPLORE_TEXT.categories)}
            <CategoryGrid onPick={ex.pickType} />
          </View>
        )
      case 'trending':
        return ex.trending.length > 0 ? (
          <View key={key} style={styles.stack}>
            {sectionTitle(EXPLORE_TEXT.trending)}
            <TrendingList trending={ex.trending} onPick={ex.setQuery} />
          </View>
        ) : null
      case 'services':
        return (
          <View key={key} style={styles.stack}>
            {sectionTitle(SERVICE_TEXT.section)}
            <ServicesRow side={SIDE} />
          </View>
        )
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: bottomSpace + 24 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <HomeGreeting onOrder={() => setOrdering(true)} />
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
            emptyCategory={ex.filters.type && !ex.filters.query.trim() ? CATEGORY_LABEL[ex.filters.type] : null}
          />
        ) : (
          <>
            {order.map(renderBlock)}
            <ContactCard />
          </>
        )}
      </ScrollView>
      <ToastHost />
      <DetailSheet item={ex.detailItem} actions={ex.actions} onClose={ex.closeDetail} />
      {ordering && (
        <SectionOrderSheetV2 order={user?.sectionOrder} onChange={(next) => void updateUser({ sectionOrder: next })} onClose={() => setOrdering(false)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingHorizontal: SIDE, gap: 22 },
  stack: { gap: 12 },
  section: { letterSpacing: 1 },
})
