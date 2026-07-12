import { useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { BookCard } from '@/components/library/BookCard'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { fetchLibraryItems, fetchUserLibrary } from '@/lib/supabase-repositories'
import { LIBRARY_CATEGORY_LABELS, type LibraryCategory, type LibraryItem } from '@/lib/types'

export default function LibraryScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()
  const { user } = useApp()

  const [items, setItems] = useState<LibraryItem[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLibraryItems().then(setItems).catch(() => setItems([])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user?.id) { setSavedIds([]); return }
    fetchUserLibrary(user.id).then((entries) => setSavedIds(entries.map((e) => e.itemId))).catch(() => {})
  }, [user?.id])

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
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>Biblioteca</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Ionicons name="search-outline" size={17} color={C.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar título o autor..."
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}>
          {saved.length > 0 && (
            <View style={styles.section}>
              <Text variant="body" weight="bold" family="poppins" style={[styles.sectionTitle, { color: C.foreground }]}>
                Mi Biblioteca
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {saved.map((item) => <BookCard key={item.id} item={item} onPress={() => goToBook(item.id)} />)}
              </ScrollView>
            </View>
          )}

          {groups.map((group) => (
            <View key={group.value} style={styles.section}>
              <Text variant="body" weight="bold" family="poppins" style={[styles.sectionTitle, { color: C.foreground }]}>
                {group.label}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {group.items.map((item) => <BookCard key={item.id} item={item} onPress={() => goToBook(item.id)} />)}
              </ScrollView>
            </View>
          ))}

          {filtered.length === 0 && (
            <View style={styles.center}>
              <Ionicons name="book-outline" size={44} color={C.muted} />
              <Text variant="body" style={{ color: C.muted, marginTop: Spacing[3], textAlign: 'center' }}>
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
  searchInput: { flex: 1, fontFamily: Fonts.dmSans, fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing[10] },
  section: { marginTop: Spacing[5] },
  sectionTitle: { paddingHorizontal: Spacing[5], marginBottom: Spacing[3] },
  row: { paddingHorizontal: Spacing[5], gap: Spacing[3] },
})
