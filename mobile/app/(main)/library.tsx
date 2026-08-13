import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { BookCard } from '@/components/library/BookCard'
import { AdBanner } from '@/components/ui/AdBanner'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { fetchLibraryItems, fetchUserLibrary } from '@/lib/supabase-repositories'
import { LIBRARY_CATEGORY_LABELS, type LibraryCategory, type LibraryItem } from '@/lib/types'

const R = Colors.redesign
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
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Biblioteca</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color={R.header.placeholder} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar título o autor..."
            placeholderTextColor={R.header.placeholder}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={R.header.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />}
        >
          <View style={styles.section}>
            <Text family="noto-sans" weight="bold" size={17} color={R.foreground} style={styles.sectionTitle}>
              Mis colecciones
            </Text>
            {saved.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {saved.map((item) => <BookCard key={item.id} item={item} onPress={() => goToBook(item.id)} />)}
              </ScrollView>
            ) : (
              <View style={styles.emptyCollections}>
                <Ionicons name="book-outline" size={20} color={Colors.lime} />
                <Text family="noto-sans" size={13} color={R.mutedForeground}>Conocé la biblioteca del agro</Text>
              </View>
            )}
          </View>

          {groups.map((group, i) => (
            <View key={group.value}>
              <View style={styles.section}>
                <Text family="noto-sans" weight="bold" size={17} color={R.foreground} style={styles.sectionTitle}>
                  {group.label}
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
              <Ionicons name="book-outline" size={44} color={R.mutedForeground} />
              <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyText}>
                {items.length === 0 ? 'Todavía no hay títulos cargados.' : `Sin resultados para "${search}"`}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.header.chip,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 18,
  },
  searchInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 13.5, color: '#FFFFFF', padding: 0 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingTop: 20, paddingBottom: 30 },
  center: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyText: { marginTop: 12, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { paddingHorizontal: 20, marginBottom: 12 },
  row: { paddingHorizontal: 20, gap: 14 },
  emptyCollections: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: R.secondary,
  },
  adWrap: { paddingHorizontal: 20, marginBottom: 24 },
})
