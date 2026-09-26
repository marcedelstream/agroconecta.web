import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { formatPriceDelta, formatPriceValue } from '@/lib/price-format'
import type { MarketPrice } from '@/lib/types'

const F = Colors.v2.feed

interface Props {
  price: MarketPrice
  last: boolean
}

export function MarketPriceRow({ price, last }: Props) {
  const up = price.changePercent >= 0
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <View style={styles.labelCol}>
        <Text family="noto-sans" weight="semibold" size={15} lineHeight={20} color={Colors.v2.white} numberOfLines={1}>
          {price.label}
        </Text>
        <Text family="noto-sans" size={12} lineHeight={16} color={F.textMuted} numberOfLines={1}>
          {price.market} · {price.unit}
        </Text>
      </View>
      <View style={styles.valueCol}>
        <Text family="noto-sans" weight="extrabold" size={20} lineHeight={24} color={Colors.v2.white}>
          {formatPriceValue(price)}
        </Text>
        <Text family="noto-sans" weight="bold" size={12} lineHeight={16} color={up ? F.priceUp : F.priceDown}>
          {formatPriceDelta(price)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: F.divider },
  labelCol: { flex: 1, gap: 2 },
  valueCol: { alignItems: 'flex-end', gap: 2 },
})
