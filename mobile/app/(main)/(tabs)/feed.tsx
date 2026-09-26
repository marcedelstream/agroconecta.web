import { StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FeedHeader } from '@/components/v2/feed/FeedHeader'
import { FeedPager } from '@/components/v2/feed/FeedPager'
import { FeedStateView } from '@/components/v2/feed/FeedStateView'
import { Colors } from '@/constants/colors'
import { useFeed } from '@/lib/feed-v2/use-feed'

// Inicio v2: feed vertical a pantalla completa (docs/design_handoff_v2_feed, README §3.1).
export default function FeedScreen() {
  const controller = useFeed()
  const { status, items, retry } = controller

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {status === 'ready' && items.length > 0 ? (
        <FeedPager controller={controller} />
      ) : (
        <FeedStateView state={status === 'ready' ? 'empty' : status} onRetry={retry} />
      )}
      <FeedHeader />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.navy },
})
