import { useEffect, useMemo, useState } from 'react'
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import WebView from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { mockVideos, newsCategories } from '@/lib/mock-data'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import type { VideoItem, NewsCategory, Post } from '@/lib/types'

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d < 1) return 'Hoy'
  if (d === 1) return 'Ayer'
  return `Hace ${d}d`
}

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function postToVideoItem(post: Post): VideoItem {
  return {
    id: post.id,
    title: post.title,
    thumbnailUrl: post.imageUrl,
    duration: post.contentType === 'auction' ? (post.auctionStatus === 'live' ? 'En vivo' : 'Proximo') : `${post.readTime}:00`,
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

export default function VideosScreen() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>(mockVideos)
  const C = useColors()

  useEffect(() => {
    let mounted = true
    fetchPublishedPosts()
      .then((posts) => {
        const remoteVideos = posts
          .filter((post) => post.contentType === 'video' || post.contentType === 'auction')
          .map(postToVideoItem)
        if (mounted && remoteVideos.length > 0) setVideos(remoteVideos)
      })
      .catch(() => {
        if (mounted) setVideos(mockVideos)
      })
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const videoItems = videos.filter((v) => v.contentType !== 'auction')
    if (!activeCategory) return videoItems
    return videoItems.filter((v) => v.category === activeCategory)
  }, [activeCategory, videos])
  const featuredAuction = videos.find((v) => v.contentType === 'auction' && v.auctionStatus !== 'finished')

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            {featuredAuction && <AuctionHero video={featuredAuction} />}
            <Header activeCategory={activeCategory} onSelect={setActiveCategory} />
          </>
        }
        renderItem={({ item }) => <VideoCard video={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="videocam-outline" size={48} color={C.muted} />
            <Text variant="body" color={C.muted} style={styles.emptyText}>
              Sin videos para esta categoría.
            </Text>
          </View>
        }
      />
    </View>
  )
}

function AuctionHero({ video }: { video: VideoItem }) {
  const C = useColors()
  return (
    <View style={[styles.auctionCard, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.auctionHeader}>
        <View style={styles.auctionTitleBlock}>
          <Text variant="label" style={{ color: Colors.lime }}>REMATE DESTACADO</Text>
          <Text variant="subtitle" weight="bold" family="poppins" style={styles.auctionTitle}>
            {video.title}
          </Text>
        </View>
        <View style={[styles.liveBadge, video.auctionStatus !== 'live' && { backgroundColor: C.secondary, borderColor: C.border }]}>
          <View style={[styles.liveDot, video.auctionStatus !== 'live' && { backgroundColor: C.muted }]} />
          <Text variant="label" style={{ color: video.auctionStatus === 'live' ? '#fff' : C.muted }}>
            {video.auctionStatus === 'live' ? 'EN VIVO' : 'PROXIMO'}
          </Text>
        </View>
      </View>
      {video.youtubeUrl ? (
        <WebView
          source={{ uri: video.youtubeUrl }}
          style={styles.auctionWebview}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
        />
      ) : (
        <View style={[styles.auctionPlaceholder, { backgroundColor: C.secondary }]}>
          <Ionicons name="calendar-outline" size={32} color={C.muted} />
          <Text variant="body" color={C.muted}>Transmision pendiente de confirmacion.</Text>
        </View>
      )}
      <Text variant="caption" color={C.muted}>{video.channel}</Text>
    </View>
  )
}

function Header({
  activeCategory,
  onSelect,
}: {
  activeCategory: NewsCategory | null
  onSelect: (c: NewsCategory | null) => void
}) {
  const C = useColors()
  return (
    <View style={styles.header}>
      <Text variant="subtitle" weight="bold" family="poppins">Galería de Videos</Text>
      <Text variant="body" color={C.muted} style={styles.headerDesc}>
        Contenido audiovisual del agro paraguayo
      </Text>

      <FlatList
        horizontal
        data={[null, ...newsCategories.map((c) => c.value)] as (NewsCategory | null)[]}
        keyExtractor={(c) => c ?? 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const isActive = item === activeCategory
          return (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={[
                styles.filterChip,
                { backgroundColor: C.surface, borderColor: C.border },
                isActive && styles.filterChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                weight="semibold"
                style={{ color: isActive ? '#0A0A13' : C.muted }}
              >
                {item ? categoryLabel(item) : 'Todos'}
              </Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

function VideoCard({ video }: { video: VideoItem }) {
  const C = useColors()
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={styles.thumbContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} />
        <View style={styles.thumbOverlay} />
        {/* Play button */}
        <View style={styles.playBtn}>
          <Ionicons name="play" size={18} color="#fff" />
        </View>
        {/* Duration */}
        <View style={styles.durationBadge}>
          <Text variant="label" style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Badge variant={video.category} style={styles.catBadge}>
          {categoryLabel(video.category)}
        </Badge>
        <Text variant="caption" weight="semibold" numberOfLines={2} style={{ lineHeight: 17, color: C.foreground }}>
          {video.title}
        </Text>
        <View style={styles.meta}>
          <Text variant="label" color={C.muted} numberOfLines={1} style={styles.channel}>
            {video.channel}
          </Text>
          <Text variant="label" color={C.muted}>
            {formatViews(video.views)} vistas · {timeAgo(video.publishedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing[4], paddingBottom: Spacing[8] },
  row: { gap: Spacing[3], marginBottom: Spacing[3] },
  header: { gap: Spacing[2], marginBottom: Spacing[4] },
  headerDesc: { marginTop: -Spacing[1] },
  auctionCard: { borderWidth: 1, borderRadius: Radius.base, padding: Spacing[3], gap: Spacing[3], marginBottom: Spacing[5] },
  auctionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing[3] },
  auctionTitleBlock: { flex: 1, minWidth: 0 },
  auctionTitle: { marginTop: Spacing[1], flexShrink: 1 },
  auctionWebview: { height: 210, borderRadius: Radius.md, overflow: 'hidden' },
  auctionPlaceholder: { height: 210, alignItems: 'center', justifyContent: 'center', gap: Spacing[2], borderRadius: Radius.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[1], backgroundColor: Colors.destructive, paddingHorizontal: Spacing[2], paddingVertical: Spacing[1], borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.destructive, alignSelf: 'flex-start', minWidth: 78, flexShrink: 0 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  filterRow: { gap: Spacing[2], paddingVertical: Spacing[1] },
  filterChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterChipActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  card: {
    flex: 1,
    borderRadius: Radius.base,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumbContainer: { height: 100, position: 'relative' },
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
  catBadge: {},
  meta: { gap: 2 },
  channel: {},
  empty: { alignItems: 'center', paddingTop: Spacing[12], gap: Spacing[3] },
  emptyText: { textAlign: 'center' },
})
