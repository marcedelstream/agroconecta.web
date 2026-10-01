import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useInterestCatalog } from '@/lib/interest-options'

interface Props {
  selected: string | null
  onToggle: (rubro: string) => void
  /** Margen lateral de la pantalla: la fila sale de borde a borde pero arranca alineada al contenido. */
  side: number
}

export function RubroChips({ selected, onToggle, side }: Props) {
  const { rubros } = useInterestCatalog()
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -side }}
      contentContainerStyle={[styles.row, { paddingHorizontal: side }]}
    >
      {rubros.map((r) => {
        const on = r.value === selected
        return (
          <TouchableOpacity
            key={r.value}
            onPress={() => onToggle(r.value)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.pill, on && styles.pillOn]}
          >
            <Text family="noto-sans" weight="semibold" size={14} color={on ? Colors.v2.white : Colors.v2.navy}>
              {r.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  pill: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: Colors.v2.sheet.border,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOn: { backgroundColor: Colors.v2.navy, borderColor: Colors.v2.navy },
})
