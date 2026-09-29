import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'

export interface FarmRow {
  tipo: string
  valor: string
}

interface Props {
  rows: FarmRow[]
  onChange: (rows: FarmRow[]) => void
  typePlaceholder: string
  valuePlaceholder: string
  addLabel: string
}

// Filas "tipo + número" de Mi campo (animales: tipo + cantidad; cultivos: tipo + hectáreas).
export function FarmRowsEditor({ rows, onChange, typePlaceholder, valuePlaceholder, addLabel }: Props) {
  const set = (i: number, change: Partial<FarmRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...change } : r)))
  return (
    <View style={styles.wrap}>
      {rows.map((r, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            value={r.tipo}
            onChangeText={(tipo) => set(i, { tipo })}
            placeholder={typePlaceholder}
            placeholderTextColor={Colors.v2.light.placeholder}
            style={[styles.input, styles.type]}
          />
          <TextInput
            value={r.valor}
            onChangeText={(valor) => set(i, { valor: valor.replace(/[^0-9.,]/g, '') })}
            placeholder={valuePlaceholder}
            placeholderTextColor={Colors.v2.light.placeholder}
            keyboardType="decimal-pad"
            style={[styles.input, styles.value]}
          />
          <TouchableOpacity onPress={() => onChange(rows.filter((_, j) => j !== i))} accessibilityRole="button" accessibilityLabel="Quitar" hitSlop={8} style={styles.remove}>
            <Ionicons name="close" size={18} color={Colors.v2.muted} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => onChange([...rows, { tipo: '', valor: '' }])} accessibilityRole="button" style={styles.add}>
        <Ionicons name="add" size={18} color={Colors.v2.limeText} />
        <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.limeText}>{addLabel}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.ground,
    paddingHorizontal: 14,
    fontFamily: Fonts.dmSans,
    fontSize: 15,
    color: Colors.v2.navy,
  },
  type: { flex: 1 },
  value: { width: 96 },
  remove: { width: 32, alignItems: 'center' },
  add: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6 },
})
