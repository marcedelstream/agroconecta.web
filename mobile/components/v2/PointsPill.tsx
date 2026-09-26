import { StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { POINTS_TEXT } from '@/lib/feed-v2/labels'
import { usePoints } from '@/lib/feed-v2/points'
import { useApp } from '@/lib/app-context'

// Píldora de puntos de la cabecera del feed: solo el número ("120 pts"). Lleva a Canjear.
export function PointsPill() {
  const { balance } = usePoints()
  const { session } = useApp()
  if (!session) return null
  return (
    <TouchableOpacity
      onPress={() => router.push('/(main)/canjes' as never)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={POINTS_TEXT.pillA11y(balance)}
    >
      <GlassSurface
        tint="dark"
        overlayColor={Colors.v2.glass.bg}
        androidColor={Colors.v2.feed.glassAndroid}
        borderColor={Colors.v2.glass.border}
        style={styles.pill}
      >
        <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.white}>{POINTS_TEXT.pts(balance)}</Text>
      </GlassSurface>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: { height: V2Layout.minTouch, paddingHorizontal: 16, borderRadius: V2Layout.minTouch / 2, justifyContent: 'center' },
})
