import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { AdBanner } from '@/components/ui/AdBanner'
import { Colors } from '@/constants/colors'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import type { Post, NewsCategory } from '@/lib/types'

const R = Colors.redesign

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'ganaderia', label: 'Ganadería' },
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'clima', label: 'Clima' },
  { value: 'mercados', label: 'Mercados' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'institucional', label: 'Institucional' },
]

// Cada cuántas secciones se intercala un banner
const AD_EVERY = 2

function videoDuration(post: Post) {
  if (post.contentType === 'auction') return post.auctionStatus === 'live' ? 'En vivo' : 'Próximo'
  return `${post.readTime} min`
}

export default function VideosScreen() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adRefreshKey, setAdRefreshKey] = useState(0)

  const loadPosts = useCallback(async () => {
    try {
      const remote = await fetchPublishedPosts()
      setPosts(remote.filter((p) => p.contentType === 'video' || p.contentType === 'auction'))
    } catch {
      setPosts([])
    }
  }, [])

  useEffect(() => {
    let mounted = true
    loadPosts().finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [loadPosts])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setAdRefreshKey((k) => k + 1)
    await loadPosts()
    setRefreshing(false)
  }, [loadPosts])

  const goToVideo = (id: string) => router.push(`/(main)/video/${id}` as any)

  const auctions = useMemo(
    () => posts.filter((p) => p.contentType === 'auction' && p.auctionStatus !== 'finished'),
    [posts]
  )
  const regularPosts = useMemo(() => posts.filter((p) => p.contentType !== 'auction'), [posts])

  const groups = useMemo(() => {
    const list: { key: string; label: string; items: Post[] }[] = []
    if (auctions.length > 0) list.push({ key: 'remates', label: 'Remates', items: auctions })
    for (const cat of CATEGORIES) {
      const items = regularPosts.filter((p) => p.category === cat.value)
      if (items.length > 0) list.push({ key: cat.value, label: cat.label, items })
    }
    return list
  }, [auctions, regularPosts])

  const isEmpty = !loading && posts.length === 0

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Galería de Videos</Text>
          <View style={{ width: 20 }} />
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
          {isEmpty && (
            <View style={styles.empty}>
              <Ionicons name="videocam-outline" size={44} color={R.mutedForeground} />
              <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyText}>
                No hay videos disponibles todavía.
              </Text>
            </View>
          )}

          {groups.map((group, i) => (
            <View key={group.key}>
              <View style={styles.section}>
                <Text family="noto-sans" weight="bold" size={17} color={R.foreground} style={styles.sectionTitle}>
                  {group.label}
                </Text>
                <View style={styles.grid}>
                  {group.items.map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      style={styles.card}
                      activeOpacity={0.85}
                      onPress={() => goToVideo(video.id)}
                    >
                      <View style={styles.thumbWrap}>
                        <Image source={{ uri: video.imageUrl }} style={styles.thumb} resizeMode="cover" />
                        <View style={styles.thumbOverlay} />
                        <View style={styles.playBtn}>
                          <Ionicons name="play" size={13} color={R.foreground} />
                        </View>
                        <View style={styles.durationPill}>
                          <Text family="noto-sans" weight="semibold" size={10} color="#FFFFFF">{videoDuration(video)}</Text>
                        </View>
                      </View>
                      <Text family="noto-sans" weight="semibold" size={13} lineHeight={17} color={R.foreground} style={styles.cardTitle} numberOfLines={2}>
                        {video.title}
                      </Text>
                      <Text family="noto-sans" size={11} color={R.mutedForeground} style={styles.cardChannel}>
                        {video.source}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {(i + 1) % AD_EVERY === 0 && (
                <View style={styles.adWrap}>
                  <AdBanner placement="videos" refreshKey={adRefreshKey} />
                </View>
              )}
            </View>
          ))}

          {groups.length > 0 && groups.length % AD_EVERY !== 0 && (
            <View style={styles.adWrap}>
              <AdBanner placement="videos" refreshKey={adRefreshKey} />
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
    paddingBottom: 16,
  },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingTop: 20, paddingBottom: 30 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyText: { marginTop: 12, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { marginHorizontal: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  card: { width: '47%', flexGrow: 1 },
  thumbWrap: { borderRadius: 14, overflow: 'hidden', aspectRatio: 16 / 9, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  playBtn: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -16,
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPill: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardTitle: { marginTop: 8 },
  cardChannel: { marginTop: 3 },
  adWrap: { paddingHorizontal: 20, marginBottom: 24 },
})
