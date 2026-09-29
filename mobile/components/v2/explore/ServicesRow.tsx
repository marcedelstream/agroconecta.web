import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { SERVICES } from '@/lib/services-data'

const V = Colors.v2
const CARD_WIDTH = 168

// Servicios de Agroconecta (consultoría ambiental, comunicación, marketing, software…) en Explorar.
export function ServicesRow({ side }: { side: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, { paddingHorizontal: side }]} style={{ marginHorizontal: -side }}>
      {SERVICES.map((s) => (
        <TouchableOpacity key={s.id} onPress={() => router.push(`/(main)/service/${s.id}` as never)} activeOpacity={0.85} accessibilityRole="button" style={styles.card}>
          <View style={styles.icon}>
            <Ionicons name={s.icon} size={20} color={V.navy} />
          </View>
          <Text family="noto-sans" weight="bold" size={15} lineHeight={19} color={V.navy} numberOfLines={2}>{s.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { gap: 10 },
  card: { width: CARD_WIDTH, minHeight: 120, borderRadius: 20, backgroundColor: V.surface, padding: 14, gap: 12, justifyContent: 'space-between' },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: V.lime, alignItems: 'center', justifyContent: 'center' },
})
