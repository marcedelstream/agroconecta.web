import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { FeedContentSlide } from '@/components/v2/feed/FeedContentSlide'
import { MarketFeedSlide } from '@/components/v2/feed/MarketFeedSlide'
import { PollSlide } from '@/components/v2/interactive/PollSlide'
import { QuizSlide } from '@/components/v2/interactive/QuizSlide'
import { RefreshingPill } from '@/components/v2/feed/RefreshingPill'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { V2Layout } from '@/constants/spacing'
import { Colors } from '@/constants/colors'
import { flushFeedEvents, trackFeedEvent } from '@/lib/feed-v2/telemetry'
import type { FeedItem } from '@/lib/feed-v2/types'
import { PREFETCH_THRESHOLD, type FeedController } from '@/lib/feed-v2/use-feed'

// Umbrales de BACKEND-Y-DATOS.md §3.1.
const IMPRESSION_MS = 600
const SKIP_FAST_MS = 1200
const VIEWABILITY = { itemVisiblePercentThreshold: 80 }
// Cuánto hay que tirar hacia abajo en el primer item para recargar (solo iOS, ver más abajo).
const PULL_TO_REFRESH_PX = 70
// En iOS el RefreshControl nativo le suma un inset arriba al scroll mientras carga y eso descuadra el
// enganche por páginas; ahí se detecta el tirón a mano. En Android el nativo anda bien.
const NATIVE_REFRESH = Platform.OS === 'android'

interface Props {
  controller: FeedController
}

interface ActiveView {
  item: FeedItem
  since: number
}

// Cierra la vista del item que se deja: impresión (si estuvo ≥ 600 ms), permanencia y "salteado".
function closeView(view: ActiveView | null) {
  if (!view || view.item.kind !== 'content') return
  const dwell = Date.now() - view.since
  const { source, sourceId } = view.item
  if (dwell >= IMPRESSION_MS) trackFeedEvent(source, sourceId, 'impression')
  trackFeedEvent(source, sourceId, dwell < SKIP_FAST_MS ? 'skip_fast' : 'dwell', dwell)
}

export function FeedPager({ controller }: Props) {
  const { items, refreshing, refresh, loadMore, actions } = controller
  // Alto medido del contenedor, no Dimensions: así cada item mide exactamente la pantalla visible
  // (con barra de estado, recortes y barra de navegación de Android incluidos).
  const [height, setHeight] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeView = useRef<ActiveView | null>(null)
  const focused = useIsFocused()
  const { headerTop } = useFeedInsets()
  const pillTop = headerTop + V2Layout.minTouch + 12

  // Antes de recargar se cierra la vista del item actual: así cuenta como visto y la recarga
  // arranca por contenido que todavía no apareció.
  const refreshFromTop = useCallback(() => {
    closeView(activeView.current)
    activeView.current = null
    void refresh()
  }, [refresh])

  const onScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!NATIVE_REFRESH && !refreshing && e.nativeEvent.contentOffset.y < -PULL_TO_REFRESH_PX) refreshFromTop()
    },
    [refreshing, refreshFromTop],
  )

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height)
    setHeight((prev) => (prev === h ? prev : h))
  }, [])

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
    const first = viewableItems[0]
    if (!first || first.index === null) return
    if (activeView.current?.item.key === first.item.key) return
    closeView(activeView.current)
    activeView.current = { item: first.item, since: Date.now() }
    setActiveIndex(first.index)
  }).current

  // Salir de la tab o mandar la app al fondo cierra la vista y vacía la cola de telemetría.
  useEffect(() => {
    if (focused) {
      if (activeView.current) activeView.current.since = Date.now()
      return
    }
    closeView(activeView.current)
    void flushFeedEvents()
  }, [focused])

  useEffect(() => {
    if (items.length > 0 && activeIndex >= items.length - PREFETCH_THRESHOLD) void loadMore()
  }, [activeIndex, items.length, loadMore])

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      switch (item.kind) {
        case 'market':
          return <MarketFeedSlide height={height} />
        case 'poll':
          return <PollSlide item={item} height={height} />
        case 'quiz':
          return <QuizSlide item={item} height={height} />
        default:
          return <FeedContentSlide item={item} height={height} active={focused && index === activeIndex} actions={actions} />
      }
    },
    [height, activeIndex, focused, actions],
  )

  return (
    <View style={styles.root} onLayout={onLayout}>
      {height > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          extraData={activeIndex}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY}
          // Ventana chica a propósito: pantalla actual + vecinas. Cada item es una foto a pantalla completa.
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          removeClippedSubviews={Platform.OS === 'android'}
          onScrollEndDrag={onScrollEndDrag}
          refreshControl={
            NATIVE_REFRESH ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshFromTop}
                progressViewOffset={pillTop}
                colors={[Colors.v2.navy]}
                progressBackgroundColor={Colors.v2.lime}
              />
            ) : undefined
          }
        />
      )}
      {refreshing && !NATIVE_REFRESH && <RefreshingPill top={pillTop} />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.navy },
})
