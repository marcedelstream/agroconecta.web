import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, SectionList, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Linking } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { LiveEventsTicker } from '@/components/home/LiveEventsTicker'
import { fetchAllEvents } from '@/lib/supabase-repositories'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import type { AgroEvent } from '@/lib/types'

const SUGGEST_URL = 'https://eventosagropy.com'

interface DaySection {
  title: string
  dateKey: string
  data: AgroEvent[]
}

function formatDayLabel(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  d.setHours(0, 0, 0, 0)
  const diff = Math.floor((d.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  return d.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupByDay(events: AgroEvent[]): DaySection[] {
  const map = new Map<string, AgroEvent[]>()
  for (const ev of events) {
    const key = ev.date
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(ev)
  }
  return Array.from(map.entries()).map(([dateKey, data]) => ({
    title: formatDayLabel(dateKey),
    dateKey,
    data,
  }))
}

function formatTime(ev: AgroEvent) {
  return ev.time ?? ''
}

export default function EventsListScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()
  const [allEvents, setAllEvents] = useState<AgroEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      const data = await fetchAllEvents()
      setAllEvents(data)
    } catch {
      // mantiene lo que ya había cargado
    }
  }, [])

  useEffect(() => {
    loadEvents().finally(() => setLoading(false))
  }, [loadEvents])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadEvents()
    setRefreshing(false)
  }, [loadEvents])

  const categories = useMemo(() => {
    const set = new Set(allEvents.map((e) => e.category).filter(Boolean))
    return Array.from(set).sort()
  }, [allEvents])

  const filtered = useMemo(() => {
    let list = allEvents
    if (category) list = list.filter((e) => e.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) => e.title.toLowerCase().includes(q)
          || e.location.toLowerCase().includes(q)
          || (e.city ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [allEvents, category, search])

  const sections = useMemo(() => groupByDay(filtered), [filtered])

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="subtitle" weight="bold" family="poppins" style={{ color: C.foreground }}>
          Eventos
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Buscador */}
      <View style={[styles.searchBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Ionicons name="search-outline" size={17} color={C.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar evento, lugar..."
          placeholderTextColor={C.muted}
          style={[styles.searchInput, { color: C.foreground }]}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros por categoría */}
      {categories.length > 0 && (
        <View style={[styles.filtersWrap, { borderBottomColor: C.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
            <TouchableOpacity
              style={[styles.chip, { borderColor: C.border, backgroundColor: !category ? Colors.lime : C.surface }]}
              onPress={() => setCategory(null)}
            >
              <Text variant="caption" weight="semibold" style={{ color: !category ? '#0A0A13' : C.muted }}>Todas</Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const active = category === cat
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, { borderColor: active ? Colors.lime : C.border, backgroundColor: active ? Colors.lime : C.surface }]}
                  onPress={() => setCategory(active ? null : cat)}
                >
                  <Text variant="caption" weight="semibold" style={{ color: active ? '#0A0A13' : C.muted }}>{cat}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} size="large" />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={48} color={C.muted} />
          <Text variant="body" style={{ color: C.muted, marginTop: Spacing[3], textAlign: 'center' }}>
            {allEvents.length === 0 ? 'No hay eventos próximos.' : `Sin resultados para "${search || category}"`}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing[8] }]}
          stickySectionHeadersEnabled={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <>
              <LiveEventsTicker events={allEvents} />
              <TouchableOpacity
                style={[styles.suggestTop, { borderColor: `${Colors.lime}50` }]}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(SUGGEST_URL)}
              >
                <Ionicons name="add-circle-outline" size={13} color={Colors.lime} />
                <Text style={[styles.suggestTopText, { color: Colors.lime }]}>Sugerir un evento</Text>
                <Ionicons name="open-outline" size={11} color={`${Colors.lime}90`} />
              </TouchableOpacity>
            </>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.dayHeader}>
              <View style={[styles.dayDot, { backgroundColor: Colors.lime }]} />
              <Text variant="body" weight="bold" family="poppins" style={{ color: C.foreground }}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/(main)/event/${item.slug}` as any)}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder, { backgroundColor: C.secondary }]}>
                  <Ionicons name="calendar-outline" size={28} color={Colors.lime} />
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardMeta}>
                  {item.time ? (
                    <View style={styles.metaChip}>
                      <Ionicons name="time-outline" size={12} color={Colors.lime} />
                      <Text style={[styles.metaText, { color: Colors.lime }]}>{formatTime(item)}</Text>
                    </View>
                  ) : null}
                  {item.category ? (
                    <View style={[styles.metaChip, { backgroundColor: `${C.muted}18` }]}>
                      <Text style={[styles.metaText, { color: C.muted }]}>{item.category}</Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="body" weight="semibold" numberOfLines={2} style={{ color: C.foreground }}>
                  {item.title}
                </Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={C.muted} />
                  <Text variant="caption" style={{ color: C.muted, flex: 1 }} numberOfLines={1}>
                    {[item.city, item.location].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.muted} style={styles.chevron} />
            </TouchableOpacity>
          )}
          SectionSeparatorComponent={() => <View style={{ height: Spacing[2] }} />}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[3] }} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.dmSans,
    fontSize: 15,
  },
  filtersWrap: { borderBottomWidth: 1 },
  filtersRow: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing[3] },
  list: { padding: Spacing[5], gap: Spacing[1] },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[3],
  },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: { width: 88, height: 88 },
  cardImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: Spacing[3], gap: Spacing[1.5] },
  cardMeta: { flexDirection: 'row', gap: Spacing[2] },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.lime}18`,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
  },
  metaText: { fontSize: 10, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  chevron: { marginRight: Spacing[3] },
  suggestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    marginBottom: Spacing[2],
  },
  suggestTopText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
