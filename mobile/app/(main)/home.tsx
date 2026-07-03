import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { AdBanner } from '@/components/ui/AdBanner'
import { NewsCardGridSkeleton } from '@/components/ui/Skeleton'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { NewsCardGrid } from '@/components/home/NewsCardGrid'
import { SectionHeader } from '@/components/home/SectionHeader'
import { EventsSection } from '@/components/home/EventsSection'
import { EcosistemaSection } from '@/components/home/EcosistemaSection'
import { OrganizationsSection } from '@/components/home/OrganizationsSection'
import { useColors } from '@/lib/theme-context'
import { buildSegment } from '@/lib/feed-utils'
import { mockNews } from '@/lib/mock-data'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import { useApp } from '@/lib/app-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import type { Post } from '@/lib/types'

const NEWS_PREVIEW = 5

export default function HomeScreen() {
  const { user } = useApp()
  const C = useColors()
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchPublishedPosts()
      .then((remote) => { if (mounted && remote.length > 0) setPosts(remote) })
      .catch(() => { if (mounted) setPosts(mockNews) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    let list = [...posts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))
    }
    const highlighted = list.find((p) => p.isHighlighted)
    if (highlighted) return [highlighted, ...list.filter((p) => p.id !== highlighted.id)]
    return list
  }, [posts, search])

  const featuredPosts = filtered.slice(0, 3)
  const latestPosts = filtered.slice(3)
  const previewPosts = latestPosts.slice(0, NEWS_PREVIEW)

  const segment = user ? buildSegment(user) : undefined

  const goToArticle = useCallback((id: string) => {
    router.push(`/article/${id}`)
  }, [])

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: C.background }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    >
      {/* Buscador */}
      <View style={[styles.searchBox, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Ionicons name="search-outline" size={18} color={C.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar"
          placeholderTextColor={C.muted}
          style={[styles.searchInput, { color: C.foreground }]}
          autoCorrect={false}
          blurOnSubmit={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.section}>
          <View style={styles.newsGrid}>
            {Array.from({ length: 6 }).map((_, i) => <NewsCardGridSkeleton key={i} />)}
          </View>
        </View>
      ) : (
        <>
          {/* Noticias destacadas */}
          <FeaturedGrid posts={featuredPosts} onPress={goToArticle} />

          {/* Banner publicitario (posición 3) */}
          <AdBanner segment={segment} style={styles.adBanner} />

          {/* ── Más Noticias (posición 4, antes de eventos) ── */}
          {previewPosts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Más Noticias"
                action={{ label: 'Ver todas', onPress: () => router.push('/(main)/noticias' as any) }}
              />
              <View style={styles.newsGrid}>
                {previewPosts.map((item) => (
                  <NewsCardGrid key={item.id} article={item} onPress={() => goToArticle(item.id)} />
                ))}
              </View>
              {latestPosts.length > NEWS_PREVIEW && (
                <TouchableOpacity
                  style={[styles.verMasBtn, { borderColor: C.border }]}
                  onPress={() => router.push('/(main)/noticias' as any)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="newspaper-outline" size={16} color={C.muted} />
                  <Text variant="caption" weight="semibold" style={{ color: C.muted }}>
                    Ver todas las noticias
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {!loading && search.trim() !== '' && previewPosts.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={40} color={C.muted} />
          <Text variant="body" style={{ color: C.muted, textAlign: 'center', marginTop: 12 }}>
            Sin resultados para "{search}".
          </Text>
        </View>
      )}

      {/* Próximos eventos */}
      <EventsSection search={search} />

      {/* Ecosistema */}
      <EcosistemaSection onViewAll={() => router.navigate('/(main)/ecosystem' as any)} />

      {/* Organizaciones */}
      <OrganizationsSection />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Spacing[5], gap: Spacing[6], paddingBottom: Spacing[10] },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: Spacing[2],
    borderWidth: 1,
    marginTop: Spacing[3],
  },
  searchInput: { flex: 1, fontFamily: Fonts.dmSans, fontSize: 15 },
  section: { gap: Spacing[3] },
  newsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  adBanner: { marginVertical: Spacing[1] },
  empty: { alignItems: 'center', paddingTop: Spacing[8] },
  verMasBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    marginTop: Spacing[1],
    borderTopWidth: 1,
  },
})
