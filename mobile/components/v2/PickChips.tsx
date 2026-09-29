import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

interface Props {
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

// Selección única compacta (pastillas) para formularios v2.
export function PickChips({ options, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text family="noto-sans" weight="semibold" size={14} color={on ? Colors.v2.limeTintText : Colors.v2.navy}>{o.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.v2.light.inputBorder, justifyContent: 'center' },
  chipOn: { backgroundColor: Colors.v2.limeTint, borderColor: Colors.v2.limeText },
})
