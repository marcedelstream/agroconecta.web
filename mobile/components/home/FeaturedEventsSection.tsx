import { useEffect, useState } from 'react'
import { FlatList, Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { fetchFeaturedEvents, fetchEventBySlug } from '@/lib/supabase-repositories'
import type { AgroEvent, EventMedia } from '@/lib/types'

const R = Colors.redesign

interface FeaturedItem {
  media: EventMedia
  event: AgroEvent
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'long' })
}

export function FeaturedEventsSection() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchFeaturedEvents()
      .then(async (mediaList) => {
        const resolved = await Promise.all(
          mediaList.map(async (media) => {
            const event = await fetchEventBySlug(media.eventSlug).catch(() => null)
            if (!event || (!media.bannerImageUrl && !event.imageUrl)) return null
            return { media, event }
          })
        )
        if (mounted) setItems(resolved.filter((item): item is FeaturedItem => item !== null))
      })
      .catch(() => { if (mounted) setItems([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <View>
      <View style={styles.bleed}>
        <FlatList
          data={items}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.media.eventSlug}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item }) => <FeaturedEventCard item={item} />}
        />
      </View>
    </View>
  )
}

function FeaturedEventCard({ item }: { item: FeaturedItem }) {
  const { media, event } = item
  const imageUrl = media.bannerImageUrl ?? event.imageUrl

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/(main)/event/${event.slug}` as any)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(10,10,19,0.55)', 'rgba(10,10,19,0.92)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.nowBadge}>
        <View style={styles.nowDot} />
        <Text family="noto-sans" weight="bold" size={10.5} color="#0A0A13" style={styles.nowText}>AHORA</Text>
      </View>
      <View style={styles.body}>
        <Text family="noto-sans" weight="extrabold" size={18} lineHeight={22} color="#FFFFFF" numberOfLines={2}>
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
  bleed: { marginHorizontal: -Spacing[5] },
  list: { paddingLeft: Spacing[5], paddingRight: Spacing[2] },
  card: { width: 260, height: 156, borderRadius: 18, overflow: 'hidden', backgroundColor: R.surface },
  image: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  imagePlaceholder: { backgroundColor: R.secondary },
  nowBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.lime,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0A0A13' },
  nowText: { letterSpacing: 0.6 },
  body: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
})
