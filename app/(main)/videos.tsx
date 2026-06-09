import { useEffect, useState } from 'react'
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { fetchPublishedPosts } from '@/lib/supabase-repositories'
import type { VideoItem, Post } from '@/lib/types'

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

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export default function VideosScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const C = useColors()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchPublishedPosts()
      .then((posts) => {
        if (!mounted) return
        const remoteVideos = posts
          .filter((p) => p.contentType === 'video' || p.contentType === 'auction')
          .map(postToVideo)
        setVideos(remoteVideos)
      })
      .catch(() => { if (mounted) setVideos([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const auctions = videos.filter((v) => v.contentType === 'auction' && v.auctionStatus !== 'finished')
  const regularVideos = videos.filter((v) => v.contentType !== 'auction')

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <FlatList
        data={regularVideos}
        keyExtractor={(v) => v.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            <Text variant="subtitle" weight="bold" family="poppins" style={styles.title}>
              Galería de Videos
            </Text>

            {/* Cards de remates / en vivo */}
            {auctions.map((v) => (
              <AuctionCard key={v.id} video={v} />
            ))}

            {regularVideos.length > 0 && (
              <Text variant="caption" color={C.muted} style={styles.sectionLabel}>
                Últimos programas
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <VideoCard video={item} onPress={() => router.push({ pathname: '/(main)/video/[id]', params: { id: item.id } })} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="videocam-outline" size={52} color={C.muted} />
              <Text variant="body" color={C.muted} style={styles.emptyText}>
                No hay videos disponibles.{'\n'}Pronto cargaremos los últimos programas.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

function AuctionCard({ video }: { video: VideoItem }) {
  const C = useColors()
  const isLive = video.auctionStatus === 'live'
  return (
    <TouchableOpacity
      style={[styles.auctionCard, { backgroundColor: C.surface, borderColor: isLive ? Colors.destructive : C.border }]}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/(main)/video/[id]', params: { id: video.id } })}
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
        <Badge variant={video.category}>{categoryLabel(video.category)}</Badge>
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
  list: { padding: Spacing[4], paddingBottom: Spacing[8] },
  title: { marginBottom: Spacing[4] },
  sectionLabel: { marginBottom: Spacing[3], marginTop: Spacing[2] },
  row: { gap: Spacing[3], marginBottom: Spacing[3] },
  auctionCard: {
    borderWidth: 1,
    borderRadius: Radius.base,
    padding: Spacing[4],
    gap: Spacing[2],
    marginBottom: Spacing[4],
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
  meta: { gap: 2 },
  empty: { alignItems: 'center', paddingTop: Spacing[12], gap: Spacing[3] },
  emptyText: { textAlign: 'center', lineHeight: 22 },
})
