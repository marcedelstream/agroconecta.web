import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Platform, RefreshControl, StyleSheet, View, type LayoutChangeEvent, type ViewToken } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { FeedContentSlide } from '@/components/v2/feed/FeedContentSlide'
import { MarketFeedSlide } from '@/components/v2/feed/MarketFeedSlide'
import { Colors } from '@/constants/colors'
import { flushFeedEvents, trackFeedEvent } from '@/lib/feed-v2/telemetry'
import type { FeedItem } from '@/lib/feed-v2/types'
import { PREFETCH_THRESHOLD, type FeedController } from '@/lib/feed-v2/use-feed'

// Umbrales de BACKEND-Y-DATOS.md §3.1.
const IMPRESSION_MS = 600
const SKIP_FAST_MS = 1200
const VIEWABILITY = { itemVisiblePercentThreshold: 80 }

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
    ({ item, index }: { item: FeedItem; index: number }) =>
      item.kind === 'market' ? (
        <MarketFeedSlide height={height} />
      ) : (
        <FeedContentSlide item={item} height={height} active={focused && index === activeIndex} actions={actions} />
      ),
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.v2.white} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.navy },
})
