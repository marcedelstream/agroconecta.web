import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GlassCircle } from '@/components/v2/feed/GlassCircle'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { FEED_TEXT } from '@/lib/feed-v2/labels'

// Cabecera fija sobre el feed. En el prototipo se repite dentro de cada item, pero es idéntica en
// todos: dibujarla una sola vez encima del pager ahorra trabajo en cada deslizamiento.
// La píldora de puntos ("120 pts") se suma en la Fase 2, cuando existan los puntos.
export function FeedHeader() {
  const { headerTop, side } = useFeedInsets()
  return (
    <View style={[styles.row, { top: headerTop, left: side, right: side }]} pointerEvents="box-none">
      <Text family="noto-sans" weight="extrabold" size={20} lineHeight={24} color={Colors.v2.white} style={styles.wordmark}>
        <Text family="noto-sans" weight="extrabold" size={20} lineHeight={24} color={Colors.v2.lime}>
          {FEED_TEXT.wordmarkAgro}
        </Text>
        {FEED_TEXT.wordmarkConecta}
      </Text>
      <GlassCircle
        size={V2Layout.minTouch}
        onPress={() => router.navigate('/(main)/(tabs)/explorar' as never)}
        accessibilityLabel={FEED_TEXT.search}
      >
        <Ionicons name="search" size={20} color={Colors.v2.white} />
      </GlassCircle>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: {
    letterSpacing: -0.6,
    textShadowColor: Colors.v2.feed.textShadow,
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 1 },
  },
})
