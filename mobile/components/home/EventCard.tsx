import { TouchableOpacity, Image, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import type { AgroEvent } from '@/lib/types'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' }).toUpperCase()
}

interface Props {
  event: AgroEvent
  onPress: () => void
}

export function EventCard({ event, onPress }: Props) {
  const C = useColors()
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: C.secondary }]}>
          <Ionicons name="calendar-outline" size={28} color={C.lime} />
        </View>
      )}

      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>{formatDate(event.date)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: C.foreground }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={C.muted} />
          <Text variant="caption" style={{ color: C.muted, flex: 1 }} numberOfLines={1}>
            {event.city ?? event.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { width: 152, borderRadius: Radius.base, overflow: 'hidden', borderWidth: 1 },
  image: { width: '100%', aspectRatio: 1 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  dateBadge: {
    position: 'absolute',
    top: Spacing[2],
    left: Spacing[2],
    backgroundColor: Colors.lime,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
  },
  dateText: { fontSize: 10, fontWeight: '700', color: '#0A0A13' },
  content: { padding: Spacing[2.5], gap: Spacing[1] },
  title: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
})
