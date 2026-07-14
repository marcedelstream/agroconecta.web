import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Image, RefreshControl, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { AdBanner } from '@/components/ui/AdBanner'
import { HeroCarouselSkeleton, VideoCardSkeleton } from '@/components/ui/Skeleton'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { SectionHeader } from '@/components/home/SectionHeader'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import type { VideoItem, Post, NewsCategory } from '@/lib/types'

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'ganaderia',     label: 'Ganadería' },
  { value: 'agricultura',   label: 'Agricultura' },
  { value: 'clima',         label: 'Clima' },
  { value: 'mercados',      label: 'Mercados' },
  { value: 'tecnologia',    label: 'Tecnología' },
  { value: 'institucional', label: 'Institucional' },
]

function postToVideo(post: Post): VideoItem {
  return {
    id: post.id,
    title: post.title,
    thumbnailUrl: post.imageUrl,
    duration: post.contentType === 'auction'
      ? (post.auctionStatus === 'live' ? 'En vivo' : 'Próximo')
      : `${post.readTime} min`,
    channel: post.source,
    category: post.category,
    views: 0,
    publishedAt: post.publishedAt,
    videoUrl: post.youtubeUrl,
    youtubeUrl: post.youtubeUrl,
    contentType: post.contentType === 'auction' ? 'auction' : 'video',
    auctionStatus: post.auctionStatus,
    startsAt: post.startsAt,
    organizationId: post.organizationId,
  }
}

function timeAgo(date: Date): string {
  const d = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (d < 1) return 'Hoy'
  if (d === 1) return 'Ayer'
  return `Hace ${d}d`
}

export default function VideosScreen() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adRefreshKey, setAdRefreshKey] = useState(0)
  const C = useColors()
  const insets = useSafeAreaInsets()

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

  const goToVideo = (id: string) => router.push({ pathname: '/(main)/video/[id]', params: { id } })

  const auctions = useMemo(
    () => posts.filter((p) => p.contentType === 'auction' && p.auctionStatus !== 'finished').map(postToVideo),
    [posts]
  )
  const regularPosts = useMemo(() => posts.filter((p) => p.contentType !== 'auction'), [posts])
  const heroPosts = regularPosts.slice(0, 3)
  const restPosts = regularPosts.slice(3)

  const grouped = useMemo(
    () => CATEGORIES
      .map((cat) => ({ ...cat, items: restPosts.filter((p) => p.category === cat.value).map(postToVideo) }))
      .filter((g) => g.items.length > 0),
    [restPosts]
  )

  const isEmpty = !loading && posts.length === 0

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>
          Galería de Videos
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />}
      >
        {loading ? (
          <>
            <HeroCarouselSkeleton />
            <View style={styles.grid}>
              {Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)}
            </View>
          </>
        ) : (
          <>
            {heroPosts.length > 0 && (
              <View style={styles.hero}>
                <FeaturedGrid posts={heroPosts} onPress={goToVideo} />
              </View>
            )}

            {auctions.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Remates" />
                <View style={{ gap: Spacing[3] }}>
                  {auctions.map((v) => (
                    <AuctionCard key={v.id} video={v} onPress={() => goToVideo(v.id)} />
                  ))}
                </View>
              </View>
            )}

            {grouped.map((group) => (
              <View key={group.value} style={styles.section}>
                <SectionHeader title={group.label} />
                <View style={styles.grid}>
                  {group.items.map((video) => (
                    <VideoCard key={video.id} video={video} onPress={() => goToVideo(video.id)} />
                  ))}
                </View>
              </View>
            ))}

            {isEmpty && (
              <View style={styles.empty}>
                <Ionicons name="videocam-outline" size={52} color={C.muted} />
                <Text variant="body" color={C.muted} style={styles.emptyText}>
                  No hay videos disponibles.{'\n'}Pronto cargaremos los últimos programas.
                </Text>
              </View>
            )}

            <AdBanner placement="videos" refreshKey={adRefreshKey} style={styles.adBanner} />
          </>
        )}
      </ScrollView>
    </View>
  )
}

function AuctionCard({ video, onPress }: { video: VideoItem; onPress: () => void }) {
  const C = useColors()
  const isLive = video.auctionStatus === 'live'
  return (
    <TouchableOpacity
      style={[styles.auctionCard, { backgroundColor: C.surface, borderColor: isLive ? Colors.destructive : C.border }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.auctionTop}>
        <Text variant="label" style={{ color: Colors.lime }}>
          {isLive ? 'REMATE EN VIVO' : 'REMATE PRÓXIMO'}
        </Text>
        <View style={[styles.liveBadge, { backgroundColor: isLive ? Colors.destructive : C.secondary, borderColor: isLive ? Colors.destructive : C.border }]}>
          <View style={[styles.liveDot, { backgroundColor: isLive ? '#fff' : C.muted }]} />
          <Text variant="label" style={{ color: isLive ? '#fff' : C.muted, fontSize: 10 }}>
            {isLive ? 'EN VIVO' : 'PRÓXIMO'}
          </Text>
        </View>
      </View>
      <Text variant="body" weight="bold" family="poppins" numberOfLines={2}>{video.title}</Text>
      <Text variant="caption" color={C.muted}>{video.channel}</Text>
    </TouchableOpacity>
  )
}

function VideoCard({ video, onPress }: { video: VideoItem; onPress: () => void }) {
  const C = useColors()
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.thumbContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} />
        <View style={styles.thumbOverlay} />
        <View style={styles.playBtn}>
          <Ionicons name="play" size={18} color="#fff" />
        </View>
        <View style={styles.durationBadge}>
          <Text variant="label" style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text variant="caption" weight="semibold" numberOfLines={2} style={{ lineHeight: 17, color: C.foreground }}>
          {video.title}
        </Text>
        <View style={styles.meta}>
          <Text variant="label" color={C.muted} numberOfLines={1}>{video.channel}</Text>
          <Text variant="label" color={C.muted}>{timeAgo(video.publishedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  content: { paddingHorizontal: Spacing[5], paddingTop: Spacing[4], paddingBottom: Spacing[8], gap: Spacing[6] },
  hero: { marginBottom: Spacing[2] },
  section: { gap: Spacing[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  adBanner: { marginTop: Spacing[2] },
  auctionCard: {
    borderWidth: 1,
    borderRadius: Radius.base,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  auctionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Radius.base,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumbContainer: { width: '100%', aspectRatio: 16 / 9, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  playBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -18,
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing[1],
    right: Spacing[1],
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: 10, fontFamily: Fonts.dmSansMedium },
  info: { padding: Spacing[2.5], gap: Spacing[1.5] },
  meta: { gap: 2 },
  empty: { alignItems: 'center', paddingTop: Spacing[12], gap: Spacing[3] },
  emptyText: { textAlign: 'center', lineHeight: 22 },
})
