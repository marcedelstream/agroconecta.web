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

// Chips grandes para elegir (una o varias opciones). Quien los usa decide si es selección única.
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
            {on && <Ionicons name="checkmark" size={18} color={Colors.v2.white} />}
            <Text family="noto-sans" weight="semibold" size={16} color={on ? Colors.v2.white : Colors.v2.navy}>{o.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.v2.sheet.border,
    backgroundColor: Colors.v2.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipOn: { backgroundColor: Colors.v2.navy, borderColor: Colors.v2.navy },
})
