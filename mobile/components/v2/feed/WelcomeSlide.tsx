import { memo, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { CTA_HEIGHT, CTA_RADIUS, useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { fetchWelcomePoints } from '@/lib/feed-v2/points'

const GIFT = 84

export const WELCOME_TEXT = {
  title: 'Iniciá sesión para ver todo el contenido',
  gift: (pts: number) => `y llevate ${pts} puntos de regalo por bienvenida`,
  giftNoPts: 'y empezá a sumar puntos',
  body: 'Guardá lo que te interesa, seguí a quienes publican, respondé encuestas y hablá con Karai.',
  cta: 'Iniciar sesión',
  swipe: 'O deslizá para mirar sin cuenta',
} as const

// Primera tarjeta del feed para invitados: se puede mirar todo sin cuenta (Apple 5.1.1(v)), y esto
// invita a entrar con el incentivo de los puntos de bienvenida.
function WelcomeSlideBase({ height }: { height: number }) {
  const { headerTop, ctaBottom, side } = useFeedInsets()
  const [points, setPoints] = useState<number | null>(null)

  useEffect(() => {
    fetchWelcomePoints().then(setPoints).catch(() => null)
  }, [])

  return (
    <View style={[styles.slide, { height }]}>
      <LinearGradient colors={Colors.v2.feed.fallback} style={StyleSheet.absoluteFill} />
      <View style={styles.ring} />
      <View style={[styles.content, { paddingTop: headerTop + 60, paddingBottom: ctaBottom, paddingHorizontal: side + 6 }]}>
        <View style={styles.gift}>
          <Ionicons name="gift" size={40} color={Colors.v2.navy} />
        </View>
        <Text family="noto-sans" weight="extrabold" size={30} lineHeight={35} color={Colors.v2.white} style={styles.center}>
          {WELCOME_TEXT.title}
        </Text>
        <Text family="noto-sans" weight="bold" size={19} lineHeight={25} color={Colors.v2.lime} style={styles.center}>
          {points ? WELCOME_TEXT.gift(points) : WELCOME_TEXT.giftNoPts}
        </Text>
        <Text family="noto-sans" size={15} lineHeight={22} color={Colors.v2.feed.textSoft} style={styles.center}>
          {WELCOME_TEXT.body}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.85} accessibilityRole="button" style={styles.cta}>
          <Text family="noto-sans" weight="bold" size={17} color={Colors.v2.navy}>{WELCOME_TEXT.cta}</Text>
        </TouchableOpacity>
        <View style={styles.swipe}>
          <Ionicons name="chevron-up" size={18} color={Colors.v2.feed.textMuted} />
          <Text family="noto-sans" size={14} color={Colors.v2.feed.textMuted}>{WELCOME_TEXT.swipe}</Text>
        </View>
      </View>
    </View>
  )
}

export const WelcomeSlide = memo(WelcomeSlideBase)

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden', backgroundColor: Colors.v2.navy },
  ring: { position: 'absolute', right: -60, top: -40, width: 240, height: 240, borderRadius: 120, borderWidth: 28, borderColor: Colors.v2.lime, opacity: 0.18 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  gift: { width: GIFT, height: GIFT, borderRadius: GIFT / 2, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  center: { textAlign: 'center' },
  cta: { alignSelf: 'stretch', height: CTA_HEIGHT, borderRadius: CTA_RADIUS, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  swipe: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
})
