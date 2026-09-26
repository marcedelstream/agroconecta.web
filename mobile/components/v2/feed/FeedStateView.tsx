import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { FEED_TEXT } from '@/lib/feed-v2/labels'

interface Props {
  state: 'loading' | 'error' | 'empty'
  onRetry: () => void
}

export function FeedStateView({ state, onRetry }: Props) {
  if (state === 'loading') {
    return (
      <View style={styles.root}>
        <ActivityIndicator color={Colors.v2.lime} size="large" />
      </View>
    )
  }

  const isError = state === 'error'
  return (
    <View style={styles.root}>
      <Ionicons name={isError ? 'cloud-offline-outline' : 'leaf-outline'} size={40} color={Colors.v2.lime} />
      <Text family="noto-sans" weight="extrabold" size={22} lineHeight={27} color={Colors.v2.white} style={styles.center}>
        {isError ? FEED_TEXT.errorTitle : FEED_TEXT.emptyTitle}
      </Text>
      <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.feed.textSoft} style={styles.center}>
        {isError ? FEED_TEXT.errorBody : FEED_TEXT.emptyBody}
      </Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retry}>
        <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy}>
          {FEED_TEXT.retry}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.navy, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  center: { textAlign: 'center' },
  retry: {
    marginTop: 8,
    height: V2Layout.minTouch,
    paddingHorizontal: 24,
    borderRadius: V2Layout.minTouch / 2,
    backgroundColor: Colors.v2.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
