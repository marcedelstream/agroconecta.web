import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { AdBanner } from '@/components/ui/AdBanner'
import { HeaderAvatar } from '@/components/navigation/HeaderAvatar'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { useApp } from '@/lib/app-context'
import { mockNews, getCategoryLabel } from '@/lib/mock-data'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import { isNewsContent, buildSegment } from '@/lib/feed-utils'
import type { NewsCategory, Post } from '@/lib/types'

const R = Colors.redesign

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'ganaderia', label: 'Ganadería' },
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'clima', label: 'Clima' },
  { value: 'mercados', label: 'Mercados' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'institucional', label: 'Institucional' },
]

function timeAgo(date: Date): string {
  const h = Math.floor((Date.now() - date.getTime()) / 3600000)
  if (h < 1) return 'Hace menos de 1h'
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

export default function NoticiasScreen() {
  const { user } = useApp()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adRefreshKey, setAdRefreshKey] = useState(0)
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null)
  const [search, setSearch] = useState('')

  const loadPosts = useCallback(async () => {
    try {
      const remote = await fetchPublishedPosts()
      const news = remote.filter(isNewsContent)
      if (news.length > 0) setPosts(news)
    } catch {
      setPosts(mockNews)
    }
  }, [])

  useEffect(() => {
    loadPosts().finally(() => setLoading(false))
  }, [loadPosts])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setAdRefreshKey((k) => k + 1)
    await loadPosts()
    setRefreshing(false)
  }, [loadPosts])

  const filtered = useMemo(() => {
    let list = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))
    return list
  }, [posts, activeCategory, search])

  const hero = filtered[0]
  const rows = filtered.slice(1)
  const segment = user ? buildSegment(user) : undefined

  const goToArticle = useCallback((id: string) => {
    router.push(`/article/${id}`)
  }, [])

  return (
    <View style={[styles.root, { backgroundColor: R.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text family="noto-sans" weight="bold" size={18} color="#FFFFFF">Noticias</Text>
            </View>
            <HeaderAvatar name={user?.name} />
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={17} color={R.header.placeholder} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar noticias"
              placeholderTextColor={R.header.placeholder}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroller} contentContainerStyle={styles.chipsRow}>
            <TouchableOpacity
              style={[styles.chip, !activeCategory && styles.chipActive]}
              onPress={() => setActiveCategory(null)}
              activeOpacity={0.8}
            >
              <Text family="noto-sans" weight="semibold" size={12} color={!activeCategory ? '#0A0A13' : '#C9C9D2'}>
                Todas
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.value
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveCategory(active ? null : cat.value)}
                  activeOpacity={0.8}
                >
                  <Text family="noto-sans" weight="semibold" size={12} color={active ? '#0A0A13' : '#C9C9D2'}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />}
      >
        {loading && (
          <View style={styles.centerFill}>
            <ActivityIndicator color={Colors.lime} />
          </View>
        )}

        {!loading && hero && (
          <>
            <View style={styles.heroWrap}>
              <TouchableOpacity style={styles.heroCard} activeOpacity={0.9} onPress={() => goToArticle(hero.id)}>
                <Image source={{ uri: hero.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.heroBody}>
                  <View style={styles.heroChip}>
                    <Text family="noto-sans" weight="bold" size={10} color={R.limeSoftText} style={styles.chipLabel}>
                      {getCategoryLabel(hero.category).toUpperCase()}
                    </Text>
                  </View>
                  <Text family="noto-sans" weight="bold" size={17} lineHeight={23} color={R.foreground}>
                    {hero.title}
                  </Text>
                  <Text family="noto-sans" size={11.5} color={R.mutedForeground}>
                    {hero.source} · {timeAgo(hero.publishedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {rows.length > 0 && (
              <View style={styles.rowsWrap}>
                <View style={styles.rowsCard}>
                  {rows.map((post, i) => (
                    <TouchableOpacity
                      key={post.id}
                      style={[styles.row, i < rows.length - 1 && styles.rowDivider]}
                      activeOpacity={0.75}
                      onPress={() => goToArticle(post.id)}
                    >
                      <Image source={{ uri: post.imageUrl }} style={styles.thumb} resizeMode="cover" />
                      <View style={styles.rowText}>
                        <View style={styles.rowChip}>
                          <Text family="noto-sans" weight="bold" size={9} color="#5A5A66" style={styles.chipLabel}>
                            {getCategoryLabel(post.category).toUpperCase()}
                          </Text>
                        </View>
                        <Text family="noto-sans" weight="semibold" size={13} lineHeight={17} color={R.foreground} numberOfLines={2}>
                          {post.title}
                        </Text>
                        <Text family="noto-sans" size={11} color={R.mutedForeground}>
                          {post.source} · {timeAgo(post.publishedAt)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.adWrap}>
              <AdBanner segment={segment} placement="home" refreshKey={adRefreshKey} />
            </View>
          </>
        )}

        {!loading && !hero && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={R.mutedForeground} />
            <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyText}>
              Sin resultados.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    backgroundColor: R.header.bg,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.header.chip,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 13.5, color: '#FFFFFF', padding: 0 },
  chipsScroller: { marginHorizontal: -20 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 14, paddingHorizontal: 20, paddingRight: 28 },
  chip: {
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  content: { paddingBottom: 26 },
  centerFill: { alignItems: 'center', paddingTop: Spacing[10] },
  heroWrap: { paddingHorizontal: 20, marginTop: 18 },
  heroCard: { backgroundColor: R.surface, borderRadius: 16, overflow: 'hidden' },
  heroImage: { width: '100%', height: 150 },
  heroBody: { padding: 14, gap: 7 },
  heroChip: { alignSelf: 'flex-start', backgroundColor: R.limeSoftBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chipLabel: { letterSpacing: 0.5 },
  rowsWrap: { paddingHorizontal: 20, marginTop: 14 },
  rowsCard: { backgroundColor: R.surface, borderRadius: 16, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: R.divider },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  rowText: { flex: 1, minWidth: 0, gap: 4 },
  rowChip: { alignSelf: 'flex-start', backgroundColor: R.secondary, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  adWrap: { paddingHorizontal: 20, marginTop: 20 },
  empty: { alignItems: 'center', paddingTop: Spacing[10] },
  emptyText: { marginTop: Spacing[3], textAlign: 'center' },
})
