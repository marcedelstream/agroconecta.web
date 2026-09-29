import { StyleSheet, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { PLAN_TEXT, type PlanChoice } from '@/lib/feed-v2/labels'

const V = Colors.v2

// Paso del onboarding "¿Cómo querés usar Agroconecta?": Gratis / Karai Campo / Organización, con sus
// diferencias. Sin precios ni compra en la app (se contrata con el equipo, por fuera de la tienda).
export function PlanPicker({ value, onChange }: { value: PlanChoice; onChange: (v: PlanChoice) => void }) {
  return (
    <View style={styles.list}>
      {PLAN_TEXT.plans.map((p) => {
        const on = p.value === value
        return (
          <TouchableOpacity
            key={p.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null)
              onChange(p.value)
            }}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.card, on && styles.cardOn]}
          >
            <View style={styles.head}>
              <Text family="noto-sans" weight="extrabold" size={18} color={V.navy} style={styles.flex}>{p.title}</Text>
              <View style={[styles.radio, on && styles.radioOn]}>{on && <Ionicons name="checkmark" size={14} color={V.navy} />}</View>
            </View>
            <Text family="noto-sans" size={14} color={V.muted}>{p.for}</Text>
            {p.features.map((f) => (
              <View key={f} style={styles.feature}>
                <Ionicons name="checkmark-circle" size={16} color={V.limeText} />
                <Text family="noto-sans" size={14} lineHeight={19} color={V.navy} style={styles.flex}>{f}</Text>
              </View>
            ))}
          </TouchableOpacity>
        )
      })}
      <Text family="noto-sans" size={13} lineHeight={18} color={V.muted}>{PLAN_TEXT.note}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  flex: { flex: 1 },
  card: { borderRadius: 20, borderWidth: 1.5, borderColor: V.light.inputBorder, backgroundColor: V.surface, padding: 16, gap: 8 },
  cardOn: { borderColor: V.limeText, backgroundColor: V.limeTint },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: V.sheet.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: V.lime, borderColor: V.lime },
  feature: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
})
