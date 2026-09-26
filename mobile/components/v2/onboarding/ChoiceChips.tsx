import { StyleSheet, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import type { Option } from '@/lib/onboarding-v2'

interface Props {
  options: Option[]
  selected: string[]
  onToggle: (value: string) => void
}

// Opciones grandes del onboarding. Elegida = fondo verde claro, borde verde y tilde; se entiende de un
// vistazo qué está marcado. Quien los usa decide si es selección única o múltiple.
export function ChoiceChips({ options, selected, onToggle }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const on = selected.includes(o.value)
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null)
              onToggle(o.value)
            }}
            activeOpacity={0.85}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            style={[styles.chip, on && styles.chipOn]}
          >
            <View style={[styles.check, on && styles.checkOn]}>
              {on && <Ionicons name="checkmark" size={14} color={Colors.v2.navy} />}
            </View>
            <Text family="noto-sans" weight={on ? 'bold' : 'semibold'} size={16} color={Colors.v2.navy}>{o.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipOn: { backgroundColor: Colors.v2.limeTint, borderColor: Colors.v2.limeText },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.v2.sheet.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: Colors.v2.lime, borderColor: Colors.v2.lime },
})
