import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { PriceBoard } from '@/components/home/PriceBoard'
import { ContentCTA } from '@/components/v2/feed/ContentCTA'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'

interface Props {
  height: number
}

// "Tu mercado hoy" dentro del feed (decisión D1: tarjeta en el feed + acceso fijo en Explorar).
// El prototipo no la dibuja: se usa la misma forma que encuesta/quiz — tarjeta blanca centrada sobre
// fondo de marca — y se reutiliza el PriceBoard de la v1 (datos reales + compartir como imagen).
function MarketFeedSlideBase({ height }: Props) {
  const { ctaBottom, side } = useFeedInsets()
  return (
    <View style={[styles.slide, { height }]}>
      <LinearGradient colors={Colors.v2.feed.fallback} style={StyleSheet.absoluteFill} />
      <View style={[styles.center, { paddingHorizontal: side, paddingBottom: ctaBottom }]}>
        <View style={styles.card}>
          <PriceBoard />
        </View>
      </View>
      <ContentCTA
        type="precios"
        bottom={ctaBottom}
        side={side}
        onPress={() => router.push('/(main)/(tabs)/prices' as never)}
      />
    </View>
  )
}

export const MarketFeedSlide = memo(MarketFeedSlideBase)

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden', backgroundColor: Colors.v2.navy },
  center: { flex: 1, justifyContent: 'center' },
  card: { borderRadius: V2Layout.pollRadius, overflow: 'hidden', backgroundColor: Colors.v2.surface, padding: 6 },
})
