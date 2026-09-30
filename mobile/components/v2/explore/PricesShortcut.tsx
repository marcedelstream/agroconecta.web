import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { EXPLORE_TEXT } from '@/lib/feed-v2/labels'

// "Tu mercado hoy": acceso a Precios con la misma tarjeta clara que el resto del Inicio (antes era un
// bloque azul; pedido de Marle, 2026-09-30).
export function PricesShortcut() {
  return (
    <TouchableOpacity
      onPress={() => router.push('/(main)/(tabs)/prices' as never)}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={styles.card}
    >
      <View style={styles.icon}>
        <Ionicons name="trending-up" size={22} color={Colors.v2.limeTintText} />
      </View>
      <View style={styles.texts}>
        <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.navy}>{EXPLORE_TEXT.pricesTitle}</Text>
        <Text family="noto-sans" size={13} color={Colors.v2.muted}>{EXPLORE_TEXT.pricesBody}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.v2.muted} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: Colors.v2.surface },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.v2.limeTint, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
})
