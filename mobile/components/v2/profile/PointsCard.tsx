import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { POINTS_TEXT } from '@/lib/feed-v2/labels'
import { usePoints } from '@/lib/feed-v2/points'

// Tarjeta de puntos del Perfil (README §3.6), con acceso a Canjear.
export function PointsCard() {
  const { balance } = usePoints()
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="star" size={24} color={Colors.v2.navy} />
      </View>
      <View style={styles.texts}>
        <Text family="noto-sans" weight="semibold" size={13} color={Colors.v2.muted}>{POINTS_TEXT.cardTitle}</Text>
        <Text family="noto-sans" weight="extrabold" size={24} color={Colors.v2.navy}>{POINTS_TEXT.pts(balance)}</Text>
        <Text family="noto-sans" size={12} color={Colors.v2.muted}>{POINTS_TEXT.cardBody}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/(main)/canjes' as never)} accessibilityRole="button" style={styles.redeem}>
        <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.white}>{POINTS_TEXT.redeem}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, backgroundColor: Colors.v2.surface, borderWidth: 1, borderColor: Colors.v2.light.cardBorder },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  redeem: { height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: Colors.v2.navy, justifyContent: 'center' },
})
