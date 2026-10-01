import { memo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Notifications from 'expo-notifications'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { CTA_HEIGHT, CTA_RADIUS, useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { requireSession } from '@/lib/feed-v2/guest'
import { showToast } from '@/lib/feed-v2/toast'
import { registerPushToken } from '@/lib/push-notifications'

const ICON = 84

export const END_TEXT = {
  title: '¡Ya viste todo por hoy!',
  body: 'Todos los días sumamos noticias, eventos, remates y oportunidades. Volvé más tarde o te avisamos cuando haya contenido nuevo.',
  notify: 'Avisarme cuando haya contenido nuevo',
  notifyOn: 'Te vamos a avisar',
  notified: 'Listo: te avisamos cuando haya novedades.',
  denied: 'Activá las notificaciones de Agroconecta en los ajustes del teléfono.',
  again: 'Volver a empezar',
} as const

// Última tarjeta del feed cuando ya no queda nada nuevo para mostrar. El aviso usa la categoría
// "Último momento" (breakingNews), la misma que usan los envíos del panel (/admin/notificaciones).
function EndSlideBase({ height, onRestart }: { height: number; onRestart: () => void }) {
  const { headerTop, ctaBottom, side } = useFeedInsets()
  const { user, updateUser } = useApp()
  const [busy, setBusy] = useState(false)
  const [on, setOn] = useState(false)

  async function notify() {
    if (busy || !(await requireSession())) return
    setBusy(true)
    const { status } = await Notifications.requestPermissionsAsync().catch(() => ({ status: 'denied' as const }))
    if (status !== 'granted') {
      setBusy(false)
      showToast(END_TEXT.denied)
      return
    }
    if (user?.id) await registerPushToken(user.id).catch(() => null)
    const prefs = user?.notificationPrefs ?? { breakingNews: true, priceAlerts: true, weatherAlerts: true, institutionalUpdates: false }
    await updateUser({ notificationPrefs: { ...prefs, breakingNews: true } })
    setBusy(false)
    setOn(true)
    showToast(END_TEXT.notified)
  }

  return (
    <View style={[styles.slide, { height }]}>
      <LinearGradient colors={Colors.v2.feed.fallback} style={StyleSheet.absoluteFill} />
      <View style={styles.ring} />
      <View style={[styles.content, { paddingTop: headerTop + 60, paddingBottom: ctaBottom, paddingHorizontal: side + 6 }]}>
        <View style={styles.icon}>
          <Ionicons name="checkmark-done" size={40} color={Colors.v2.navy} />
        </View>
        <Text family="noto-sans" weight="extrabold" size={30} lineHeight={35} color={Colors.v2.white} style={styles.center}>{END_TEXT.title}</Text>
        <Text family="noto-sans" size={16} lineHeight={23} color={Colors.v2.feed.textSoft} style={styles.center}>{END_TEXT.body}</Text>
        <TouchableOpacity onPress={notify} disabled={busy || on} activeOpacity={0.85} accessibilityRole="button" style={[styles.cta, on && styles.ctaOn]}>
          <Ionicons name={on ? 'notifications' : 'notifications-outline'} size={20} color={Colors.v2.navy} />
          <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.navy}>{on ? END_TEXT.notifyOn : END_TEXT.notify}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRestart} accessibilityRole="button" style={styles.again}>
          <Ionicons name="refresh" size={18} color={Colors.v2.white} />
          <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.white}>{END_TEXT.again}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const EndSlide = memo(EndSlideBase)

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden', backgroundColor: Colors.v2.navy },
  ring: { position: 'absolute', left: -70, bottom: -50, width: 240, height: 240, borderRadius: 120, borderWidth: 28, borderColor: Colors.v2.lime, opacity: 0.18 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  icon: { width: ICON, height: ICON, borderRadius: ICON / 2, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  center: { textAlign: 'center' },
  cta: { alignSelf: 'stretch', flexDirection: 'row', gap: 8, height: CTA_HEIGHT, borderRadius: CTA_RADIUS, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  ctaOn: { opacity: 0.85 },
  again: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 18 },
})
