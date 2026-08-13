import { router } from 'expo-router'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import type { Post } from '@/lib/types'

const R = Colors.redesign

function minutesAgo(date: Date): string {
  const min = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000))
  if (min < 1) return 'empezó recién'
  if (min < 60) return `empezó hace ${min} min`
  const h = Math.floor(min / 60)
  return `empezó hace ${h}h`
}

interface Props {
  video: Post | null
}

export function LiveCard({ video }: Props) {
  if (!video) return null

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/(main)/video/${video.id}` as any)}
    >
      <View style={styles.iconBox}>
        <Ionicons name="radio-outline" size={21} color={R.alert} />
      </View>
      <View style={styles.text}>
        <View style={styles.liveRow}>
          <View style={styles.dot} />
          <Text family="noto-sans" weight="bold" size={10} color={R.alert} style={styles.liveLabel}>EN VIVO</Text>
        </View>
        <Text family="noto-sans" weight="semibold" size={14} color={R.foreground} numberOfLines={1}>
          {video.title}
        </Text>
        <Text family="noto-sans" size={11.5} color={R.mutedForeground}>
          {minutesAgo(video.startsAt ?? video.publishedAt)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color="#A8A8B2" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: R.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: R.alertBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 3 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: R.alert },
  liveLabel: { letterSpacing: 0.6 },
})
