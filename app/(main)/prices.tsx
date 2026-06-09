import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'

export default function PricesScreen() {
  const C = useColors()
  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.header}>
        <Text variant="subtitle" weight="bold" family="poppins">Precios</Text>
      </View>
      <View style={styles.body}>
        <View style={[styles.iconBox, { backgroundColor: `${Colors.lime}15` }]}>
          <Ionicons name="trending-up-outline" size={48} color={Colors.lime} />
        </View>
        <Text variant="title" weight="bold" family="poppins" style={{ textAlign: 'center' }}>
          Próximamente
        </Text>
        <Text variant="body" color={C.muted} style={styles.desc}>
          Pronto tendrás información actualizada de precios ganaderos y commodities directamente en la plataforma.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    gap: Spacing[4],
    paddingBottom: Spacing[16],
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  desc: {
    textAlign: 'center',
    lineHeight: 24,
  },
})
