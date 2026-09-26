import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'

const I = Colors.v2.interactive

interface Props {
  height: number
  eyebrow: string
  badge: string
  /** Badge relleno en lima una vez ganados los puntos. */
  badgeActive?: boolean
  children: React.ReactNode
}

// Encuesta y quiz van en tarjeta blanca centrada, sin barra lateral ni botón de acción (README §3.1).
export function InteractiveFrame({ height, eyebrow, badge, badgeActive, children }: Props) {
  const { headerTop, ctaBottom, side } = useFeedInsets()
  return (
    <View style={[styles.slide, { height }]}>
      <LinearGradient colors={Colors.v2.feed.fallback} style={StyleSheet.absoluteFill} />
      <View style={[styles.center, { paddingTop: headerTop + V2Layout.minTouch + 12, paddingBottom: ctaBottom, paddingHorizontal: side }]}>
        <View style={styles.card}>
          <View style={styles.head}>
            <Text family="noto-sans" weight="bold" size={11} color={Colors.v2.limeText} style={styles.eyebrow} numberOfLines={1}>
              {eyebrow}
            </Text>
            <View style={[styles.badge, badgeActive && styles.badgeOn]}>
              <Text family="noto-sans" weight="extrabold" size={12} color={badgeActive ? Colors.v2.navy : Colors.v2.limeTintText}>
                {badge}
              </Text>
            </View>
          </View>
          {children}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden', backgroundColor: Colors.v2.navy },
  center: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: Colors.v2.surface,
    borderRadius: V2Layout.pollRadius,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
    shadowColor: I.cardShadow,
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
    elevation: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  eyebrow: { flex: 1, letterSpacing: 1.1 },
  badge: { height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: Colors.v2.limeTint, justifyContent: 'center' },
  badgeOn: { backgroundColor: Colors.v2.lime },
})
