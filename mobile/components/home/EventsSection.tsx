import { useEffect, useMemo, useState } from 'react'
import { FlatList, Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { fetchUpcomingEvents } from '@/lib/supabase-repositories'
import type { AgroEvent } from '@/lib/types'

const R = Colors.redesign

interface Props {
  search?: string
}

function dateParts(dateStr: string): { day: string; month: string } {
  const date = new Date(dateStr + 'T00:00:00')
  return {
    day: date.toLocaleDateString('es-PY', { day: '2-digit' }),
    month: date.toLocaleDateString('es-PY', { month: 'short' }).replace('.', '').toUpperCase(),
  }
}

export function EventsSection({ search }: Props) {
  const [events, setEvents] = useState<AgroEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchUpcomingEvents(10)
      .then((data) => { if (mounted) setEvents(data) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    if (!search?.trim()) return events
    const q = search.toLowerCase()
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q),
    )
  }, [events, search])

  if (!loading && filtered.length === 0) return null

  return (
    <View>
      <View style={styles.headerRow}>
        <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>Eventos Agro</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/events' as any)} hitSlop={8}>
          <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
            Mostrar más
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bleed}>
        <FlatList
          data={filtered}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item }) => {
            const { day, month } = dateParts(item.date)
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/(main)/event/${item.slug}` as any)}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <Ionicons name="calendar-outline" size={22} color={Colors.lime} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <View style={styles.dateRow}>
                    <Text family="noto-sans" weight="extrabold" size={21} color={R.foreground}>{day}</Text>
                    <Text family="noto-sans" weight="semibold" size={11} color={R.mutedForeground} style={styles.month}>
                      {month}
                    </Text>
                  </View>
                  <Text family="noto-sans" weight="semibold" size={13.5} lineHeight={18} color={R.foreground} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.cityRow}>
                    <Ionicons name="location-outline" size={13} color={R.mutedForeground} />
                    <Text family="noto-sans" size={11.5} color={R.mutedForeground} numberOfLines={1} style={styles.cityText}>
                      {item.city ?? item.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  underline: { textDecorationLine: 'underline' },
  bleed: { marginHorizontal: -Spacing[5] },
  list: { paddingLeft: Spacing[5], paddingRight: Spacing[2] },
  card: { width: 182, backgroundColor: R.surface, borderRadius: 16, overflow: 'hidden' },
  cardImage: { width: '100%', height: 84 },
  cardImagePlaceholder: { backgroundColor: R.secondary, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 15, gap: 9 },
  dateRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  month: { letterSpacing: 0.5 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { flex: 1 },
})
