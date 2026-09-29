import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { GlassCircle } from '@/components/v2/feed/GlassCircle'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { FEED_TEXT } from '@/lib/feed-v2/labels'
import { PointsPill } from '@/components/v2/PointsPill'
import { useApp } from '@/lib/app-context'
import { openPublish } from '@/lib/publish'

// Cabecera fija sobre el feed. En el prototipo se repite dentro de cada item, pero es idéntica en
// todos: dibujarla una sola vez encima del pager ahorra trabajo en cada deslizamiento.
// Logo original para fondos oscuros ("agro" verde + "conecta" blanco), el mismo de Inicio v1.
const logo = require('@/assets/images/logo-dark.png')
const LOGO_HEIGHT = 30
const LOGO_RATIO = 590 / 127

export function FeedHeader() {
  const { headerTop, side } = useFeedInsets()
  const { session } = useApp()
  return (
    <View style={[styles.row, { top: headerTop, left: side, right: side }]} pointerEvents="box-none">
      <Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel={FEED_TEXT.brand} />
      <View style={styles.actions}>
        <PointsPill />
        {/* "+" visible en la esquina (review v2): publicar para organizaciones con plan. */}
        {session && (
          <GlassCircle size={V2Layout.minTouch} onPress={() => void openPublish()} accessibilityLabel={FEED_TEXT.publish}>
            <Ionicons name="add" size={24} color={Colors.v2.white} />
          </GlassCircle>
        )}
        <GlassCircle
          size={V2Layout.minTouch}
          onPress={() => router.navigate('/(main)/(tabs)/explorar' as never)}
          accessibilityLabel={FEED_TEXT.search}
        >
          <Ionicons name="search" size={20} color={Colors.v2.white} />
        </GlassCircle>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_RATIO },
})
