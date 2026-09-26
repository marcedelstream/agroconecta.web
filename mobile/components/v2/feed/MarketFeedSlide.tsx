import { memo, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { ContentCTA } from '@/components/v2/feed/ContentCTA'
import { MarketPriceRow } from '@/components/v2/feed/MarketPriceRow'
import { TypeChip } from '@/components/v2/feed/TypeChip'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { FEED_TEXT } from '@/lib/feed-v2/labels'
import { fetchMarketPrices } from '@/lib/supabase-repositories'
import type { MarketPrice } from '@/lib/types'

const F = Colors.v2.feed
const MAX_CATTLE = 2
const MAX_INTERNATIONAL = 3

interface Props {
  height: number
}

function pickBoard(prices: MarketPrice[]): MarketPrice[] {
  return [
    ...prices.filter((p) => p.kind === 'cattle').slice(0, MAX_CATTLE),
    ...prices.filter((p) => p.kind === 'international').slice(0, MAX_INTERNATIONAL),
  ]
}

function updatedLabel(board: MarketPrice[]) {
  const latest = board.reduce((acc, p) => (p.updatedAt > acc ? p.updatedAt : acc), board[0].updatedAt)
  const time = latest.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
  return `${FEED_TEXT.marketUpdated} ${time}`
}

// "Tu mercado hoy" dentro del feed (decisión D1). Sin contenedor: los precios van directo sobre el
// fondo de marca y, como es poca información, todo el bloque (con el botón) queda centrado.
function MarketFeedSlideBase({ height }: Props) {
  const { headerTop, ctaBottom, side } = useFeedInsets()
  const [board, setBoard] = useState<MarketPrice[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetchMarketPrices()
      .then((data) => mounted && setBoard(pickBoard(data)))
      .catch(() => mounted && setBoard([]))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <View style={[styles.slide, { height }]}>
      <LinearGradient colors={F.fallback} style={StyleSheet.absoluteFill} />
      <View
        style={[
          styles.content,
          { paddingTop: headerTop + V2Layout.minTouch + 16, paddingBottom: ctaBottom, paddingHorizontal: side },
        ]}
      >
        {board === null ? (
          <ActivityIndicator color={Colors.v2.lime} />
        ) : (
          <>
            <View style={styles.head}>
              <TypeChip label={FEED_TEXT.marketChip} />
              <Text family="noto-sans" weight="extrabold" size={26} lineHeight={30} color={Colors.v2.white}>
                {FEED_TEXT.marketTitle}
              </Text>
              <Text family="noto-sans" size={14} lineHeight={19} color={F.textMuted}>
                {board.length > 0 ? updatedLabel(board) : FEED_TEXT.marketEmpty}
              </Text>
            </View>
            <View>
              {board.map((price, i) => (
                <MarketPriceRow key={price.id} price={price} last={i === board.length - 1} />
              ))}
            </View>
            <ContentCTA inline type="precios" onPress={() => router.push('/(main)/(tabs)/prices' as never)} />
          </>
        )}
      </View>
    </View>
  )
}

export const MarketFeedSlide = memo(MarketFeedSlideBase)

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden', backgroundColor: Colors.v2.navy },
  content: { flex: 1, justifyContent: 'center', gap: 20 },
  head: { gap: 8, alignItems: 'flex-start' },
})
