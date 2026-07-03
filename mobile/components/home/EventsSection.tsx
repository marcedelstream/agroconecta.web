import { useEffect, useMemo, useState } from 'react'
import { FlatList, View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SectionHeader } from './SectionHeader'
import { EventCard } from './EventCard'
import { fetchUpcomingEvents } from '@/lib/supabase-repositories'
import { useColors } from '@/lib/theme-context'
import { Spacing } from '@/constants/spacing'
import type { AgroEvent } from '@/lib/types'

interface Props {
  search?: string
}

export function EventsSection({ search }: Props) {
  const C = useColors()
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
      <SectionHeader
        title="Próximos Eventos"
        action={{ label: 'Ver más', onPress: () => router.push('/(main)/events' as any) }}
      />
      {loading ? (
        <ActivityIndicator color={C.lime} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ width: Spacing[3] }} />}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => router.push(`/(main)/event/${item.slug}` as any)}
            />
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  loader: { paddingVertical: Spacing[6] },
  list: { paddingBottom: Spacing[2] },
})
