import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { LIVE_TEXT } from '@/lib/feed-v2/labels'
import type { LiveItem } from '@/lib/feed-v2/types'

const L = Colors.v2.light

interface Props {
  item: LiveItem
  onWatch: () => void
  onShowHome: () => void
}

// Fila discreta EN VIVO AHORA de Explorar (README §3.3). Si el usuario cerró el aviso en Inicio, acá
// sigue apareciendo, con "Mostrar en Inicio" para volver a verlo allá.
export function LiveRow({ item, onWatch, onShowHome }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <TouchableOpacity onPress={onWatch} style={styles.texts} accessibilityRole="button">
        <Text family="noto-sans" weight="bold" size={11} color={Colors.v2.interactive.badText} style={styles.eyebrow}>{LIVE_TEXT.now}</Text>
        <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.navy} numberOfLines={1}>{item.title}</Text>
      </TouchableOpacity>
      {item.dismissed && (
        <TouchableOpacity onPress={onShowHome} style={[styles.btn, styles.ghost]} accessibilityRole="button">
          <Text family="noto-sans" weight="bold" size={12} color={Colors.v2.navy}>{LIVE_TEXT.showHome}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onWatch} style={[styles.btn, styles.solid]} accessibilityRole="button">
        <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.white}>{LIVE_TEXT.see}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingRight: 8, paddingLeft: 14, borderRadius: 18, backgroundColor: Colors.v2.surface, borderWidth: 1, borderColor: L.cardBorder },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.v2.live },
  texts: { flex: 1, gap: 1 },
  eyebrow: { letterSpacing: 0.9 },
  btn: { height: 36, paddingHorizontal: 12, borderRadius: 18, justifyContent: 'center' },
  ghost: { borderWidth: 1, borderColor: Colors.v2.sheet.border, backgroundColor: Colors.v2.surface },
  solid: { backgroundColor: Colors.v2.navy, paddingHorizontal: 14 },
})
