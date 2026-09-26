import { StyleSheet, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

const L = Colors.v2.light

interface Props<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

// Control segmentado de las pantallas claras v2 (Precios, Guardados). Mismo dibujo que el
// prototipo: pista gris y la opción elegida en una píldora blanca.
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((o) => {
        const selected = o.value === value
        return (
          <TouchableOpacity
            key={o.value}
            activeOpacity={0.85}
            onPress={() => {
              if (selected) return
              Haptics.selectionAsync().catch(() => null)
              onChange(o.value)
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.seg, selected && styles.segOn]}
          >
            <Text family="noto-sans" weight="semibold" size={14} color={selected ? Colors.v2.navy : Colors.v2.muted}>
              {o.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 22, backgroundColor: L.segTrack },
  seg: { flex: 1, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  segOn: {
    backgroundColor: Colors.v2.surface,
    shadowColor: L.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
})
