import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { POINTS_TEXT } from '@/lib/feed-v2/labels'
import { usePoints } from '@/lib/feed-v2/points'

// Tarjeta de puntos del Perfil (README §3.6). El botón "Canjear" se suma con la pantalla de Canjes
// (Fase 5): sin premios reales confirmados no hay nada para canjear.
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
    </View>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, backgroundColor: Colors.v2.surface, borderWidth: 1, borderColor: Colors.v2.light.cardBorder },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
})
