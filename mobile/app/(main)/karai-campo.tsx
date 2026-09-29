import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { useApp } from '@/lib/app-context'
import { KARAI_CAMPO_TEXT as T } from '@/lib/feed-v2/labels'

const V = Colors.v2
const RING = 150

// Qué es KARAI Campo. A propósito sin precio ni botón de compra: la membresía se contrata por fuera de
// la app (reglas de Apple 3.1.1 / Google Play Payments). Quien ya la tiene entra directo a Mi campo.
export default function KaraiCampoScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useApp()
  const member = !!user?.isMember

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <V2ScreenHeader title="" />
        <View style={styles.body}>
          <View style={styles.hero}>
            <View style={styles.ring} />
            <Text family="noto-sans" weight="bold" size={12} color={V.lime} style={styles.eyebrow}>{T.eyebrow}</Text>
            <Text family="noto-sans" weight="extrabold" size={28} lineHeight={32} color={V.white} style={styles.heroTitle}>{T.title}</Text>
            <Text family="noto-sans" size={15} lineHeight={22} color={V.feed.textSoft}>{member ? T.memberBody : T.body}</Text>
          </View>

          <View style={styles.card}>
            {T.benefits.map((b) => (
              <View key={b.title} style={styles.benefit}>
                <View style={styles.icon}>
                  <Ionicons name={b.icon} size={20} color={V.limeTintText} />
                </View>
                <View style={styles.flex}>
                  <Text family="noto-sans" weight="bold" size={16} color={V.navy}>{b.title}</Text>
                  <Text family="noto-sans" size={14} lineHeight={20} color={V.muted}>{b.body}</Text>
                </View>
              </View>
            ))}
          </View>

          {member ? (
            <TouchableOpacity onPress={() => router.replace('/(main)/mi-campo' as never)} accessibilityRole="button" style={styles.cta}>
              <Text family="noto-sans" weight="bold" size={16} color={V.navy}>{T.goFarm}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text family="noto-sans" size={14} lineHeight={20} color={V.muted} style={styles.center}>{T.interested}</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/contacto' as never)} accessibilityRole="button" style={[styles.cta, styles.ctaDark]}>
                <Text family="noto-sans" weight="bold" size={16} color={V.white}>{T.talk}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  flex: { flex: 1, gap: 2 },
  center: { textAlign: 'center' },
  body: { paddingHorizontal: 18, gap: 16 },
  hero: { backgroundColor: V.navy, borderRadius: 26, padding: 24, gap: 10, overflow: 'hidden' },
  ring: { position: 'absolute', right: -40, top: -60, width: RING, height: RING, borderRadius: RING / 2, borderWidth: 18, borderColor: V.lime, opacity: 0.9 },
  eyebrow: { letterSpacing: 1.2 },
  heroTitle: { maxWidth: 260, letterSpacing: -0.5 },
  card: { backgroundColor: V.surface, borderRadius: 22, padding: 18, gap: 18 },
  benefit: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: V.limeTint, alignItems: 'center', justifyContent: 'center' },
  cta: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: V.lime, alignItems: 'center', justifyContent: 'center' },
  ctaDark: { backgroundColor: V.navy },
})
