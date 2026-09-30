import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { V2Sheet } from '@/components/v2/V2Sheet'
import { Colors } from '@/constants/colors'
import { HOME_BLOCKS, moveBlock, normalizeHomeOrder, type HomeBlockKey } from '@/lib/feed-v2/home-sections'
import { HOME_TEXT as T } from '@/lib/feed-v2/labels'

interface Props {
  order: string[] | undefined
  onChange: (order: HomeBlockKey[]) => void
  onClose: () => void
}

// "Ordenar intereses": subir o bajar cada bloque del Inicio. Con flechas (no arrastrar) porque se usa
// bien con una mano y dentro de la hoja no compite con el gesto de cerrar.
export function SectionOrderSheetV2({ order, onChange, onClose }: Props) {
  const [items, setItems] = useState<HomeBlockKey[]>(() => normalizeHomeOrder(order))

  function move(key: HomeBlockKey, delta: -1 | 1) {
    Haptics.selectionAsync().catch(() => null)
    const next = moveBlock(items, key, delta)
    setItems(next)
    onChange(next)
  }

  return (
    <V2Sheet title={T.orderTitle} subtitle={T.orderBody} onClose={onClose}>
      <View style={styles.card}>
        {items.map((key, i) => {
          const meta = HOME_BLOCKS.find((b) => b.key === key)!
          return (
            <View key={key} style={[styles.row, i < items.length - 1 && styles.divider]}>
              <View style={styles.icon}>
                <Ionicons name={meta.icon} size={18} color={Colors.v2.limeText} />
              </View>
              <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy} style={styles.flex}>{meta.label}</Text>
              <TouchableOpacity onPress={() => move(key, -1)} disabled={i === 0} accessibilityRole="button" accessibilityLabel={T.up(meta.label)} style={[styles.arrow, i === 0 && styles.off]}>
                <Ionicons name="chevron-up" size={18} color={Colors.v2.navy} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => move(key, 1)} disabled={i === items.length - 1} accessibilityRole="button" accessibilityLabel={T.down(meta.label)} style={[styles.arrow, i === items.length - 1 && styles.off]}>
                <Ionicons name="chevron-down" size={18} color={Colors.v2.navy} />
              </TouchableOpacity>
            </View>
          )
        })}
      </View>
    </V2Sheet>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 20, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.v2.light.inputBorder },
  icon: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.v2.limeTint, alignItems: 'center', justifyContent: 'center' },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.v2.ground, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.3 },
})
