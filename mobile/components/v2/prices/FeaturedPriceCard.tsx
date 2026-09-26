import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { PRICES_TEXT } from '@/lib/feed-v2/labels'
import { formatPriceDelta, formatPriceValue } from '@/lib/price-format'
import type { MarketPrice } from '@/lib/types'

const F = Colors.v2.feed

// Precio destacado en tarjeta oscura (mismo lenguaje que la tarjeta de puntos del prototipo).
export function FeaturedPriceCard({ price }: { price: MarketPrice }) {
  const up = price.changePercent >= 0
  return (
    <View style={styles.card}>
      <Text family="noto-sans" weight="bold" size={11} color={F.textMuted} style={styles.eyebrow}>
        {PRICES_TEXT.featured} · {price.unit.toUpperCase()}
      </Text>
      <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.white}>
        {price.label}
      </Text>
      <View style={styles.valueRow}>
        <Text family="noto-sans" weight="extrabold" size={34} lineHeight={38} color={Colors.v2.white} style={styles.value}>
          {formatPriceValue(price)}
        </Text>
        <Text family="noto-sans" weight="bold" size={14} color={up ? F.priceUp : F.priceDown}>
          {formatPriceDelta(price)}
        </Text>
      </View>
      <Text family="noto-sans" size={12} color={F.textMuted} numberOfLines={1}>
        {price.market}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.v2.navy, borderRadius: 20, padding: 20, gap: 6 },
  eyebrow: { letterSpacing: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  value: { letterSpacing: -0.8, flexShrink: 1 },
})
