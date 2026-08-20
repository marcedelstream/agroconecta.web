import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import type { AgroEvent, EventMedia } from '@/lib/types'

const R = Colors.redesign

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'long' })
}

interface Props {
  media: EventMedia
  event: AgroEvent
}

export function FeaturedEventBanner({ media, event }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/(main)/event/${event.slug}` as any)}
    >
      <Image source={{ uri: media.bannerImageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />
      <View style={styles.body}>
        <View style={styles.tag}>
          <Ionicons name="star" size={11} color={Colors.lime} />
          <Text family="noto-sans" weight="bold" size={10.5} color={Colors.lime} style={styles.tagText}>EVENTO DESTACADO</Text>
        </View>
        <Text family="noto-sans" weight="extrabold" size={17} color="#FFFFFF" numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color="#E5E5E5" />
          <Text family="noto-sans" size={12} color="#E5E5E5">{formatDate(event.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden', height: 168, backgroundColor: R.surface },
  image: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,19,0.35)' },
  body: { flex: 1, justifyContent: 'flex-end', padding: 16, gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  tagText: { letterSpacing: 0.6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
})
