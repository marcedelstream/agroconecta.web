import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { AdBanner } from '@/components/ui/AdBanner'
import { FilterSheet } from '@/components/navigation/FilterSheet'
import { FeaturedCard } from '@/components/home/FeaturedCard'
import { NewsCard } from '@/components/home/NewsCard'
import { SectionHeader } from '@/components/home/SectionHeader'
import { useColors } from '@/lib/theme-context'
import { buildFeedItems, buildSegment } from '@/lib/feed-utils'
import { mockNews } from '@/lib/mock-data'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import { useApp } from '@/lib/app-context'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import type { FeedItem } from '@/lib/feed-types'
import type { NewsArticle, NewsCategory, Post } from '@/lib/types'

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export default function HomeScreen() {
  const { user } = useApp()
  const C = useColors()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [posts, setPosts] = useState<Post[]>(mockNews)

  useEffect(() => {
    let mounted = true
    fetchPublishedPosts()
      .then((remotePosts) => {
        if (mounted && remotePosts.length > 0) setPosts(remotePosts)
      })
      .catch(() => {
        if (mounted) setPosts(mockNews)
      })
    return () => {
      mounted = false
    }
  }, [])

  const { featured, items } = useMemo(() => {
    let list = [...posts]
    if (activeCategory) list = list.filter((n) => n.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q))
    }
    const highlighted = list.find((n) => n.isHighlighted) ?? list[0]
    return buildFeedItems(list, user, highlighted)
  }, [search, activeCategory, user, posts])

  const segment = user ? buildSegment(user) : undefined

  const goToArticle = useCallback((id: string) => {
    router.push(`/article/${id}`)
  }, [])

  const header = useMemo(() => (
    <HomeHeader
      search={search}
      onSearchChange={setSearch}
      activeCategory={activeCategory}
      onClearCategory={() => setActiveCategory(null)}
      onOpenFilters={() => setFilterOpen(true)}
      featured={featured}
      onFeaturedPress={goToArticle}
      segment={segment}
    />
  ), [activeCategory, featured, goToArticle, search, segment])

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item: FeedItem, index) => {
          if (item.kind === 'article') return item.data.id
          if (item.kind === 'section-header') return `section-${item.title}`
          return `ad-${index}`
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        renderItem={({ item }: { item: FeedItem }) => {
          if (item.kind === 'section-header')
            return <SectionHeader title={item.title} subtitle={item.subtitle} />
          if (item.kind === 'ad')
            return <AdBanner segment={item.segment} style={styles.adBanner} />
          return <NewsCard article={item.data} onPress={() => goToArticle(item.data.id)} />
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={48} color={C.muted} />
            <Text variant="body" style={{ color: C.muted, textAlign: 'center', marginTop: 12 }}>
              No hay noticias para este filtro.
            </Text>
          </View>
        }
      />

      {filterOpen && (
        <FilterSheet
          selected={activeCategory}
          onSelect={setActiveCategory}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </View>
  )
}

function HomeHeader({
  search,
  onSearchChange,
  activeCategory,
  onClearCategory,
  onOpenFilters,
  featured,
  onFeaturedPress,
  segment,
}: {
  search: string
  onSearchChange: (value: string) => void
  activeCategory: NewsCategory | null
  onClearCategory: () => void
  onOpenFilters: () => void
  featured: NewsArticle | undefined
  onFeaturedPress: (id: string) => void
  segment: ReturnType<typeof buildSegment> | undefined
}) {
  const C = useColors()
  return (
    <>
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Buscar noticias..."
            placeholderTextColor={C.muted}
            style={[styles.searchInput, { color: C.foreground }]}
            autoCorrect={false}
            blurOnSubmit={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onOpenFilters} style={styles.filterBtn} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color={C.lime} />
        </TouchableOpacity>
      </View>

      {activeCategory && (
        <View style={styles.activeCatRow}>
          <Badge variant={activeCategory}>{categoryLabel(activeCategory)}</Badge>
          <TouchableOpacity onPress={onClearCategory} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </TouchableOpacity>
        </View>
      )}

      {featured && <FeaturedCard article={featured} onPress={() => onFeaturedPress(featured.id)} />}
      <AdBanner segment={segment} style={styles.adBanner} />
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: Spacing[5], gap: Spacing[3], paddingBottom: Spacing[6] },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingTop: Spacing[3], paddingBottom: Spacing[2] },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: Radius.base, paddingHorizontal: Spacing[3], paddingVertical: Spacing[2.5], gap: Spacing[2], borderWidth: 1 },
  searchInput: { flex: 1, fontFamily: Fonts.dmSans, fontSize: 15 },
  filterBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  activeCatRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingBottom: Spacing[2] },
  adBanner: { marginVertical: Spacing[1] },
  empty: { alignItems: 'center', paddingTop: Spacing[12] },
})
