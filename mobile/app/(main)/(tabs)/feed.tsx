import { StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { DetailSheet } from '@/components/v2/detail/DetailSheet'
import { FeedHeader } from '@/components/v2/feed/FeedHeader'
import { ToastHost } from '@/components/v2/ToastHost'
import { FeedPager } from '@/components/v2/feed/FeedPager'
import { FeedStateView } from '@/components/v2/feed/FeedStateView'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { LiveBanner } from '@/components/v2/live/LiveBanner'
import { V2Layout } from '@/constants/spacing'
import { openLive, useLive } from '@/lib/feed-v2/live'
import { Colors } from '@/constants/colors'
import { useFeed } from '@/lib/feed-v2/use-feed'

// Inicio v2: feed vertical a pantalla completa (docs/design_handoff_v2_feed, README §3.1).
export default function FeedScreen() {
  const controller = useFeed()
  const { status, items, retry, actions, detailItem, closeDetail } = controller
  const { live, setDismissed } = useLive()
  const { headerTop } = useFeedInsets()
  const liveNow = live.find((l) => !l.dismissed)

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {status === 'ready' && items.length > 0 ? (
        <FeedPager controller={controller} />
      ) : (
        <FeedStateView state={status === 'ready' ? 'empty' : status} onRetry={retry} />
      )}
      <FeedHeader />
      {liveNow && (
        <LiveBanner
          item={liveNow}
          top={headerTop + V2Layout.minTouch + 12}
          onWatch={() => openLive(liveNow)}
          onDismiss={() => void setDismissed(liveNow, true)}
        />
      )}
      <ToastHost />
      <DetailSheet item={detailItem} actions={actions} onClose={closeDetail} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.navy },
})
