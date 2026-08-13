import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import type { AgroEvent } from '@/lib/types'

const R = Colors.redesign

function isLiveNow(event: AgroEvent): boolean {
  const today = new Date().toISOString().slice(0, 10)
  const end = event.endDate ?? event.date
  return today >= event.date && today <= end
}

interface Props {
  events: AgroEvent[]
}

export function LiveEventsTicker({ events }: Props) {
  const live = events.filter(isLiveNow)

  if (live.length === 0) return null

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text family="noto-sans" weight="bold" size={11.5} color={R.alert} style={styles.headerLabel}>
          EN VIVO AHORA
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {live.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/(main)/event/${event.slug}` as any)}
          >
            {event.imageUrl ? (
              <Image source={{ uri: event.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Ionicons name="calendar-outline" size={22} color={R.alert} />
              </View>
            )}
            <View style={styles.liveBadge}>
              <View style={styles.liveBadgeDot} />
              <Text family="noto-sans" weight="bold" size={9} color="#FFFFFF">EN VIVO</Text>
            </View>
            <View style={styles.content}>
              <Text family="noto-sans" weight="semibold" size={12.5} lineHeight={16} color={R.foreground} numberOfLines={2}>
                {event.title}
              </Text>
              <Text family="noto-sans" size={10.5} color={R.mutedForeground} numberOfLines={1}>
                {event.city ?? event.location}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginBottom: 10 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: R.alert },
  headerLabel: { letterSpacing: 0.6 },
  row: { paddingHorizontal: 20, gap: 12 },
  card: {
    width: 148,
    backgroundColor: R.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: R.border,
    overflow: 'hidden',
  },
  image: { width: '100%', aspectRatio: 1 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: R.secondary },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: R.alert,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  liveBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFFFFF' },
  content: { padding: 10, gap: 3 },
})
