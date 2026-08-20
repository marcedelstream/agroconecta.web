import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, SectionList, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Linking } from 'react-native'
import { router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { LiveEventsTicker } from '@/components/home/LiveEventsTicker'
import { HeaderAvatar } from '@/components/navigation/HeaderAvatar'
import { fetchAllEvents } from '@/lib/supabase-repositories'
import { useApp } from '@/lib/app-context'
import { Colors } from '@/constants/colors'
import type { AgroEvent } from '@/lib/types'

const R = Colors.redesign
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
  const { user } = useApp()
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
    <View style={[styles.root, { backgroundColor: R.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text family="noto-sans" weight="bold" size={18} color="#FFFFFF">Eventos</Text>
            </View>
            {user && <HeaderAvatar name={user.name} />}
          </View>

          {categories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, !category && styles.chipActive]}
                onPress={() => setCategory(null)}
                activeOpacity={0.8}
              >
                <Text family="noto-sans" weight="semibold" size={12} color={!category ? '#0A0A13' : '#C9C9D2'}>Todas</Text>
              </TouchableOpacity>
              {categories.map((cat) => {
                const active = category === cat
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setCategory(active ? null : cat)}
                    activeOpacity={0.8}
                  >
                    <Text family="noto-sans" weight="semibold" size={12} color={active ? '#0A0A13' : '#C9C9D2'}>{cat}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} size="large" />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={44} color={R.mutedForeground} />
          <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyText}>
            {allEvents.length === 0 ? 'No hay eventos próximos.' : `Sin resultados para "${search || category}"`}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
          stickySectionHeadersEnabled={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <>
              <View style={styles.searchWrap}>
                <View style={styles.searchBox}>
                  <Ionicons name="search-outline" size={17} color={R.mutedForeground} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Buscar evento, lugar..."
                    placeholderTextColor={R.mutedForeground}
                    style={styles.searchInput}
                    autoCorrect={false}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                      <Ionicons name="close-circle" size={16} color={R.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <LiveEventsTicker events={allEvents} />

              <TouchableOpacity style={styles.suggestRow} activeOpacity={0.8} onPress={() => Linking.openURL(SUGGEST_URL)}>
                <Ionicons name="add-circle-outline" size={13} color={Colors.lime} />
                <Text family="noto-sans" weight="semibold" size={11.5} color={Colors.lime}>Sugerir un evento</Text>
                <Ionicons name="open-outline" size={11} color={R.mutedForeground} />
              </TouchableOpacity>
            </>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.dayHeader}>
              <View style={styles.dayDot} />
              <Text family="noto-sans" weight="bold" size={14} color={R.foreground}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/(main)/event/${item.slug}` as any)}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                  <Ionicons name="calendar-outline" size={26} color={Colors.lime} />
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardMeta}>
                  {item.time ? (
                    <View style={styles.metaChipLime}>
                      <Ionicons name="time-outline" size={11} color={R.limeSoftText} />
                      <Text family="noto-sans" weight="semibold" size={10} color={R.limeSoftText}>{formatTime(item)}</Text>
                    </View>
                  ) : null}
                  {item.category ? (
                    <View style={styles.metaChipMuted}>
                      <Text family="noto-sans" weight="semibold" size={10} color={R.mutedForeground}>{item.category}</Text>
                    </View>
                  ) : null}
                </View>
                <Text family="noto-sans" weight="semibold" size={13.5} lineHeight={18} color={R.foreground} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color={R.mutedForeground} />
                  <Text family="noto-sans" size={11} color={R.mutedForeground} numberOfLines={1} style={{ flex: 1 }}>
                    {[item.city, item.location].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={17} color={R.mutedForeground} />
            </TouchableOpacity>
          )}
          SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    backgroundColor: R.header.bg,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 14, paddingRight: 16 },
  chip: {
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  searchWrap: { marginTop: 16, marginBottom: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.secondary,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 13.5, color: R.foreground, padding: 0 },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 16,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 4 },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.lime },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: R.surface,
    borderRadius: 16,
    padding: 10,
  },
  cardImage: { width: 68, height: 68, borderRadius: 12 },
  cardImagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: R.secondary },
  cardBody: { flex: 1, minWidth: 0, gap: 5 },
  cardMeta: { flexDirection: 'row', gap: 6 },
  metaChipLime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: R.limeSoftBg,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaChipMuted: {
    backgroundColor: R.secondary,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
})
