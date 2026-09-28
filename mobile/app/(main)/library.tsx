import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { SearchField } from '@/components/v2/SearchField'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { LIBRARY_TEXT as T } from '@/lib/feed-v2/labels'
import { Text } from '@/components/ui/Text'
import { BookCard } from '@/components/library/BookCard'
import { AdBanner } from '@/components/ui/AdBanner'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { fetchLibraryItems, fetchUserLibrary } from '@/lib/supabase-repositories'
import { LIBRARY_CATEGORY_LABELS, type LibraryCategory, type LibraryItem } from '@/lib/types'

const V = Colors.v2
const AD_EVERY = 2

export default function LibraryScreen() {
  const { user } = useApp()

  const [items, setItems] = useState<LibraryItem[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [adRefreshKey, setAdRefreshKey] = useState(0)

  const loadSavedIds = useCallback(async () => {
    if (!user?.id) { setSavedIds([]); return }
    try {
      const entries = await fetchUserLibrary(user.id)
      setSavedIds(entries.map((e) => e.itemId))
    } catch {
      // deja lo que ya había cargado
    }
  }, [user?.id])

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchLibraryItems()
      setItems(data)
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    loadItems().finally(() => setLoading(false))
  }, [loadItems])

  useEffect(() => {
    loadSavedIds()
  }, [loadSavedIds])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setAdRefreshKey((k) => k + 1)
    await Promise.all([loadItems(), loadSavedIds()])
    setRefreshing(false)
  }, [loadItems, loadSavedIds])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((i) => i.title.toLowerCase().includes(q) || (i.author ?? '').toLowerCase().includes(q))
  }, [items, search])

  const saved = useMemo(() => filtered.filter((i) => savedIds.includes(i.id)), [filtered, savedIds])

  const groups = useMemo(
    () => (Object.entries(LIBRARY_CATEGORY_LABELS) as [LibraryCategory, string][])
      .map(([value, label]) => ({ value, label, items: filtered.filter((i) => i.category === value) }))
      .filter((g) => g.items.length > 0),
    [filtered]
  )

  function goToBook(id: string) {
    router.push(`/(main)/book/${id}` as any)
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <V2ScreenHeader title={T.title} subtitle={T.subtitle} />
      <View style={styles.search}>
        <SearchField value={search} onChangeText={setSearch} placeholder={T.search} clearLabel={T.clear} />
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={V.limeText} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={V.limeText} />}
        >
          <View style={styles.section}>
            <Text family="noto-sans" weight="bold" size={13} color={V.muted} style={styles.sectionTitle}>
              {T.collections}
            </Text>
            {saved.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {saved.map((item) => <BookCard key={item.id} item={item} onPress={() => goToBook(item.id)} />)}
              </ScrollView>
            ) : (
              <View style={styles.emptyCollections}>
                <Ionicons name="bookmark-outline" size={20} color={V.limeText} />
                <Text family="noto-sans" size={14} lineHeight={20} color={V.muted} style={styles.flex}>{T.emptyCollections}</Text>
              </View>
            )}
          </View>

          {groups.map((group, i) => (
            <View key={group.value}>
              <View style={styles.section}>
                <Text family="noto-sans" weight="bold" size={13} color={V.muted} style={styles.sectionTitle}>
                  {group.label.toUpperCase()}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                  {group.items.map((item) => <BookCard key={item.id} item={item} onPress={() => goToBook(item.id)} />)}
                </ScrollView>
              </View>
              {(i + 1) % AD_EVERY === 0 && (
                <View style={styles.adWrap}>
                  <AdBanner placement="home" refreshKey={adRefreshKey} />
                </View>
              )}
            </View>
          ))}

          {filtered.length === 0 && (
            <View style={styles.center}>
              <Ionicons name="book-outline" size={44} color={V.muted} />
              <Text family="noto-sans" size={15} color={V.muted} style={styles.emptyText}>
                {items.length === 0 ? T.empty : T.noResults(search)}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  flex: { flex: 1 },
  search: { paddingHorizontal: 18, paddingBottom: 8 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingTop: 12, paddingBottom: 40 },
  center: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyText: { marginTop: 12, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { paddingHorizontal: 18, marginBottom: 12, letterSpacing: 1 },
  row: { paddingHorizontal: 18, gap: 14 },
  emptyCollections: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: V.surface,
  },
  adWrap: { paddingHorizontal: 18, marginBottom: 24 },
})
