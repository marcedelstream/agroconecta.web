import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { POINTS_TEXT } from '@/lib/feed-v2/labels'
import { usePoints } from '@/lib/feed-v2/points'
import { useApp } from '@/lib/app-context'

// Píldora de puntos ("120 pts"). Lleva a Canjear. `light` = versión para fondos claros (Inicio); sin
// eso, la de vidrio para ir sobre las fotos del feed.
export function PointsPill({ light = false }: { light?: boolean }) {
  const { balance } = usePoints()
  const { session } = useApp()
  if (!session) return null
  const label = (
    <Text family="noto-sans" weight="bold" size={14} color={light ? Colors.v2.navy : Colors.v2.white}>{POINTS_TEXT.pts(balance)}</Text>
  )
  return (
    <TouchableOpacity
      onPress={() => router.push('/(main)/canjes' as never)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={POINTS_TEXT.pillA11y(balance)}
    >
      {light ? (
        <View style={[styles.pill, styles.light]}>
          <Ionicons name="star" size={14} color={Colors.v2.limeText} />
          {label}
        </View>
      ) : (
        <GlassSurface
          tint="dark"
          overlayColor={Colors.v2.glass.bg}
          androidColor={Colors.v2.feed.glassAndroid}
          borderColor={Colors.v2.glass.border}
          style={styles.pill}
        >
          {label}
        </GlassSurface>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: { height: V2Layout.minTouch, paddingHorizontal: 16, borderRadius: V2Layout.minTouch / 2, justifyContent: 'center' },
  light: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.v2.limeTint },
})
