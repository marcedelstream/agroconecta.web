import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View, FlatList, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { NewsCard } from '@/components/home/NewsCard'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { mockNews } from '@/lib/mock-data'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import type { NewsCategory, Post } from '@/lib/types'

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'ganaderia',    label: 'Ganadería' },
  { value: 'agricultura',  label: 'Agricultura' },
  { value: 'clima',        label: 'Clima' },
  { value: 'mercados',     label: 'Mercados' },
  { value: 'tecnologia',   label: 'Tecnología' },
  { value: 'institucional', label: 'Institucional' },
]

export default function NoticiasScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()
  const [posts, setPosts] = useState<Post[]>(mockNews)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null)

  useEffect(() => {
    fetchPublishedPosts()
      .then((remote) => { if (remote.length > 0) setPosts(remote) })
      .catch(() => { setPosts(mockNews) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = [...posts]
    if (activeCategory) list = list.filter((p) => p.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      )
    }
    return list
  }, [posts, activeCategory, search])

  const goToArticle = useCallback((id: string) => {
    router.push(`/article/${id}`)
  }, [])

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground, flex: 1 }}>
          Noticias
        </Text>
        {filtered.length > 0 && (
          <Text variant="caption" style={{ color: C.muted }}>{filtered.length} resultados</Text>
        )}
      </View>

      {/* Buscador */}
      <View style={[styles.searchBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Ionicons name="search-outline" size={17} color={C.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar"
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
      <View style={[styles.filtersWrap, { borderBottomColor: C.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              { borderColor: C.border, backgroundColor: !activeCategory ? Colors.lime : C.surface },
            ]}
            onPress={() => setActiveCategory(null)}
          >
            <Text
              variant="caption"
              weight="semibold"
              style={{ color: !activeCategory ? '#0A0A13' : C.muted }}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.value
            return (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.chip,
                  { borderColor: active ? Colors.lime : C.border, backgroundColor: active ? Colors.lime : C.surface },
                ]}
                onPress={() => setActiveCategory(active ? null : cat.value)}
              >
                <Text
                  variant="caption"
                  weight="semibold"
                  style={{ color: active ? '#0A0A13' : C.muted }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing[8] }]}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <NewsCard article={item} onPress={() => goToArticle(item.id)} />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={40} color={C.muted} />
              <Text variant="body" style={{ color: C.muted, marginTop: Spacing[3], textAlign: 'center' }}>
                Sin resultados.
              </Text>
            </View>
          }
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
    gap: Spacing[3],
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing[10] },
  list: { padding: Spacing[4], gap: Spacing[3] },
})
