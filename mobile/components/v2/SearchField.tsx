import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'

const L = Colors.v2.light
const HEIGHT = 56
const CLEAR = 40

interface Props {
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  clearLabel: string
}

// Buscador grande de las pantallas claras v2 (mismo dibujo que "Buscar en Agroconecta" de Explorar).
export function SearchField({ value, onChangeText, placeholder, clearLabel }: Props) {
  return (
    <View style={styles.box}>
      <Ionicons name="search" size={20} color={Colors.v2.muted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={L.placeholder}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel={clearLabel} style={styles.clear}>
          <Ionicons name="close" size={16} color={Colors.v2.navy} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    borderWidth: 1,
    borderColor: L.inputBorder,
    backgroundColor: Colors.v2.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 8,
    gap: 12,
    shadowColor: L.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  icon: { marginTop: 1 },
  input: { flex: 1, fontFamily: Fonts.dmSans, fontSize: 17, color: Colors.v2.navy, padding: 0 },
  clear: {
    width: CLEAR,
    height: CLEAR,
    borderRadius: CLEAR / 2,
    backgroundColor: L.clearBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
