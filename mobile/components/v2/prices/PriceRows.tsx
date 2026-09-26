import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { formatPriceDelta, formatPriceValue } from '@/lib/price-format'
import type { MarketPrice } from '@/lib/types'

const L = Colors.v2.light

export function DeltaPill({ price }: { price: MarketPrice }) {
  const up = price.changePercent >= 0
  return (
    <View style={[styles.pill, { backgroundColor: up ? L.upBg : L.downBg }]}>
      <Text family="noto-sans" weight="bold" size={12} lineHeight={16} color={up ? L.upText : L.downText}>
        {formatPriceDelta(price)}
      </Text>
    </View>
  )
}

// Lista de precios en tarjeta blanca: nombre + mercado a la izquierda, valor + variación a la derecha.
export function PriceList({ prices }: { prices: MarketPrice[] }) {
  return (
    <View style={styles.card}>
      {prices.map((price, i) => (
        <View key={price.id} style={[styles.row, i < prices.length - 1 && styles.divider]}>
          <View style={styles.left}>
            <Text family="noto-sans" weight="bold" size={15} lineHeight={20} color={Colors.v2.navy} numberOfLines={2}>
              {price.label}
            </Text>
            <Text family="noto-sans" size={12} lineHeight={16} color={Colors.v2.muted} numberOfLines={1}>
              {price.market} · {price.unit}
            </Text>
          </View>
          <View style={styles.right}>
            <Text family="noto-sans" weight="extrabold" size={16} lineHeight={20} color={Colors.v2.navy}>
              {formatPriceValue(price)}
            </Text>
            <DeltaPill price={price} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  pill: { height: 24, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 20, borderWidth: 1, borderColor: L.cardBorder, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: L.inputBorder },
  left: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
})
