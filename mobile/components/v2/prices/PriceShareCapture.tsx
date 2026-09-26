import { forwardRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '@/components/ui/Text'
import { PriceList } from '@/components/v2/prices/PriceRows'
import { Colors } from '@/constants/colors'
import type { MarketPrice } from '@/lib/types'

// Logo para fondo claro: queda pegado en el PNG que se comparte (mismo criterio que la v1).
const logo = require('@/assets/images/logo-light.png')

interface Props {
  title: string
  prices: MarketPrice[]
  footer: string
}

// Fuera de pantalla, solo para "Compartir precios" como imagen (react-native-view-shot).
export const PriceShareCapture = forwardRef<View, Props>(function PriceShareCapture({ title, prices, footer }, ref) {
  return (
    <View style={styles.offscreen} pointerEvents="none">
      <View ref={ref} collapsable={false} style={styles.card}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
        <Text family="noto-sans" weight="extrabold" size={20} color={Colors.v2.navy} style={styles.center}>
          {title}
        </Text>
        <PriceList prices={prices} />
        <Text family="noto-sans" size={11} color={Colors.v2.muted} style={styles.center}>
          {footer}
        </Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  offscreen: { position: 'absolute', top: -9999, left: 0, width: '100%' },
  card: { backgroundColor: Colors.v2.ground, marginHorizontal: 20, padding: 18, borderRadius: 20, gap: 14 },
  logo: { width: 168, height: 38, alignSelf: 'center' },
  center: { textAlign: 'center' },
})
