import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { Colors } from '@/constants/colors'
import { FEED_TEXT } from '@/lib/feed-v2/labels'

interface Props {
  top: number
}

// Aviso de "Actualizando…" arriba del feed mientras se recarga (el feed no usa el RefreshControl
// nativo en iOS; ver FeedPager).
export function RefreshingPill({ top }: Props) {
  return (
    <View style={[styles.wrap, { top }]} pointerEvents="none">
      <GlassSurface
        tint="dark"
        overlayColor={Colors.v2.glass.bg}
        androidColor={Colors.v2.feed.glassAndroid}
        borderColor={Colors.v2.glass.border}
        style={styles.pill}
      >
        <ActivityIndicator size="small" color={Colors.v2.white} />
        <Text family="noto-sans" weight="semibold" size={14} color={Colors.v2.white}>
          {FEED_TEXT.refreshing}
        </Text>
      </GlassSurface>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: { height: 40, borderRadius: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
})
