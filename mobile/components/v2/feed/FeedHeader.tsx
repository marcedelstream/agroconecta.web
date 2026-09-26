import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { GlassCircle } from '@/components/v2/feed/GlassCircle'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { FEED_TEXT } from '@/lib/feed-v2/labels'

// Cabecera fija sobre el feed. En el prototipo se repite dentro de cada item, pero es idéntica en
// todos: dibujarla una sola vez encima del pager ahorra trabajo en cada deslizamiento.
// Logo original para fondos oscuros ("agro" verde + "conecta" blanco), el mismo de Inicio v1.
const logo = require('@/assets/images/logo-dark.png')
const LOGO_HEIGHT = 30
const LOGO_RATIO = 590 / 127

// La píldora de puntos ("120 pts") se suma en la Fase 2, cuando existan los puntos.
export function FeedHeader() {
  const { headerTop, side } = useFeedInsets()
  return (
    <View style={[styles.row, { top: headerTop, left: side, right: side }]} pointerEvents="box-none">
      <Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel={FEED_TEXT.brand} />
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
  logo: { height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_RATIO },
})
