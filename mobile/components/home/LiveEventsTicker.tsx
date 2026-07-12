import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import type { AgroEvent } from '@/lib/types'

function isLiveNow(event: AgroEvent): boolean {
  const today = new Date().toISOString().slice(0, 10)
  const end = event.endDate ?? event.date
  return today >= event.date && today <= end
}

interface Props {
  events: AgroEvent[]
}

export function LiveEventsTicker({ events }: Props) {
  const C = useColors()
  const live = events.filter(isLiveNow)

  if (live.length === 0) return null

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text variant="label" weight="bold" style={{ color: Colors.destructive, letterSpacing: 0.6 }}>
          EN VIVO AHORA
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {live.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={[styles.card, { backgroundColor: C.surface, borderColor: Colors.destructive }]}
            activeOpacity={0.85}
            onPress={() => router.push(`/(main)/event/${event.slug}` as any)}
          >
            {event.imageUrl ? (
              <Image source={{ uri: event.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: C.secondary }]}>
                <Ionicons name="calendar-outline" size={22} color={Colors.destructive} />
              </View>
            )}
            <View style={styles.liveBadge}>
              <View style={styles.liveBadgeDot} />
              <Text style={styles.liveBadgeText}>EN VIVO</Text>
            </View>
            <View style={styles.content}>
              <Text style={[styles.title, { color: C.foreground }]} numberOfLines={2}>{event.title}</Text>
              <Text variant="label" style={{ color: C.muted }} numberOfLines={1}>
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
  wrap: { marginBottom: Spacing[4] },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], marginBottom: Spacing[2] },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.destructive },
  row: { gap: Spacing[3], paddingBottom: Spacing[1] },
  card: { width: 148, borderRadius: Radius.base, overflow: 'hidden', borderWidth: 1.5 },
  image: { width: '100%', aspectRatio: 1 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  liveBadge: {
    position: 'absolute',
    top: Spacing[2],
    left: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.destructive,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
  },
  liveBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  liveBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  content: { padding: Spacing[2.5], gap: Spacing[1] },
  title: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
})
