import { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { LIVE_TEXT } from '@/lib/feed-v2/labels'
import type { LiveItem } from '@/lib/feed-v2/types'

const THUMB = 64

/** Punto rojo que late (el mismo del chip EN VIVO en Explorar). */
export function LiveDot() {
  const scale = useSharedValue(1)
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.5, { duration: 700 }), -1, true)
  }, [scale])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 2 - scale.value }))
  return <Animated.View style={[styles.dot, style]} />
}

interface Props {
  item: LiveItem
  top: number
  onWatch: () => void
  onDismiss: () => void
}

// Aviso EN VIVO fijo sobre el feed, debajo de la cabecera (README §3.1): plegado (chip + título +
// flecha + X) o desplegado (miniatura, dato en vivo, "Ver en vivo" y "No me interesa").
export function LiveBanner({ item, top, onWatch, onDismiss }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <View style={[styles.wrap, { top }]}>
      <GlassSurface tint="dark" overlayColor={Colors.v2.liveCard} androidColor={Colors.v2.liveCardAndroid} borderColor={Colors.v2.liveCardBorder} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.chip}>
            <LiveDot />
            <Text family="noto-sans" weight="extrabold" size={11} color={Colors.v2.white} style={styles.chipText}>{LIVE_TEXT.chip}</Text>
          </View>
          <TouchableOpacity onPress={() => setOpen((o) => !o)} style={styles.titleBtn} accessibilityRole="button" accessibilityLabel={open ? LIVE_TEXT.collapse : LIVE_TEXT.expand}>
            <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.white} numberOfLines={1} style={styles.flex}>{item.title}</Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.v2.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} hitSlop={8} accessibilityRole="button" accessibilityLabel={LIVE_TEXT.close} style={styles.close}>
            <Ionicons name="close" size={18} color={Colors.v2.white} />
          </TouchableOpacity>
        </View>
        {open && (
          <View style={styles.expanded}>
            <View style={styles.row}>
              {item.imageUrl ? <Image source={item.imageUrl} style={styles.thumb} contentFit="cover" /> : null}
              <View style={styles.flex}>
                <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.white} numberOfLines={2}>{item.title}</Text>
                {item.subtitle ? <Text family="noto-sans" size={13} color={Colors.v2.feed.textSoft} numberOfLines={1}>{item.subtitle}</Text> : null}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={onWatch} style={[styles.btn, styles.watch]} accessibilityRole="button">
                <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.white}>{LIVE_TEXT.watch}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onDismiss} style={[styles.btn, styles.nope]} accessibilityRole="button">
                <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.white}>{LIVE_TEXT.notInterested}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </GlassSurface>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 14, right: 14, zIndex: 20 },
  card: { borderRadius: 22, padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: Colors.v2.live },
  chipText: { letterSpacing: 0.9 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.v2.white },
  titleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: V2Layout.minTouch - 8 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  expanded: { paddingTop: 10, paddingHorizontal: 4, paddingBottom: 4, gap: 12 },
  thumb: { width: THUMB, height: THUMB, borderRadius: 14 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, height: V2Layout.minTouch, borderRadius: V2Layout.minTouch / 2, alignItems: 'center', justifyContent: 'center' },
  watch: { backgroundColor: Colors.v2.live },
  nope: { backgroundColor: Colors.v2.glass.bg, borderWidth: 1, borderColor: Colors.v2.liveCardBorder },
})
