import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import type { DetailLink, FeedDetail } from '@/lib/feed-v2/detail'
import { DETAIL_TEXT } from '@/lib/feed-v2/labels'
import { canRemind } from '@/lib/feed-v2/reminders'
import type { FeedContentItem } from '@/lib/feed-v2/types'

const V = Colors.v2

interface Props {
  item: FeedContentItem
  detail: FeedDetail | null
  reminderOn: boolean
  onToggleReminder: () => void
  onToggleSave: () => void
  onShare: () => void
  /** Cierra la ficha antes de navegar, para que "atrás" vuelva al feed y no a la ficha. */
  onNavigate: () => void
}

function secondaryLabel(item: FeedContentItem, link: DetailLink) {
  if (link.kind === 'url') return DETAIL_TEXT.contact
  if (item.source === 'library') return DETAIL_TEXT.readBook
  return item.source === 'event' ? DETAIL_TEXT.eventHub : DETAIL_TEXT.fullVideo
}

// Botón principal según el tipo (README §3.2): en vivo → transmisión (rojo); evento/remate →
// recordatorio; el resto → guardar. Más compartir y, si hay, el enlace a la vista completa.
export function DetailActions({ item, detail, reminderOn, onToggleReminder, onToggleSave, onShare, onNavigate }: Props) {
  const link = detail?.secondaryLink ?? null

  function follow(target: DetailLink) {
    onNavigate()
    if (target.kind === 'route') router.push(target.href as never)
    else void Linking.openURL(target.url)
  }

  let label: string
  let active = false
  let onPress: () => void
  if (item.isLive && link) {
    label = DETAIL_TEXT.watchLive
    onPress = () => follow(link)
  } else if (canRemind(item)) {
    label = reminderOn ? DETAIL_TEXT.remindOn : DETAIL_TEXT.remindOff
    active = reminderOn
    onPress = onToggleReminder
  } else {
    label = item.saved ? DETAIL_TEXT.saved : DETAIL_TEXT.save
    active = item.saved
    onPress = onToggleSave
  }
  const live = item.isLive && link !== null
  const bg = live ? V.live : active ? V.sheet.activeBg : V.navy
  const fg = live || !active ? V.white : V.navy

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button" style={[styles.primary, { backgroundColor: bg }]}>
          <Text family="noto-sans" weight="bold" size={16} color={fg}>
            {label}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={DETAIL_TEXT.share} style={styles.share}>
          <Ionicons name="paper-plane-outline" size={20} color={V.navy} />
        </TouchableOpacity>
      </View>
      {link && !live && (
        <TouchableOpacity onPress={() => follow(link)} activeOpacity={0.7} accessibilityRole="link" style={styles.secondary}>
          <Text family="noto-sans" weight="bold" size={15} color={V.limeText}>
            {secondaryLabel(item, link)}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={V.limeText} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 14, paddingTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  primary: { flex: 1, height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, alignItems: 'center', justifyContent: 'center' },
  share: {
    width: V2Layout.ctaHeight,
    height: V2Layout.ctaHeight,
    borderRadius: V2Layout.ctaRadius,
    borderWidth: 1,
    borderColor: V.sheet.border,
    backgroundColor: V.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: V2Layout.minTouch },
})
