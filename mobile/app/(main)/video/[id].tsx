import { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import WebView from 'react-native-webview'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { fetchPublishedPostById } from '@/lib/supabase-repositories'
import type { Post } from '@/lib/types'

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function formatDate(date: Date) {
  return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getYoutubeEmbedUrl(url: string): string | null {
  // Cubre: watch?v=, youtu.be/, embed/, shorts/, live/, m.youtube.com y variantes con parámetros extra
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)
  if (!match) return null
  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&playsinline=1`
}

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const C = useColors()

  useEffect(() => {
    if (!id) return
    let mounted = true
    fetchPublishedPostById(id)
      .then((p) => { if (mounted) setPost(p) })
      .catch(() => { if (mounted) setPost(null) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  const isLive = post?.auctionStatus === 'live'
  const isAuction = post?.contentType === 'auction'
  const embedUrl = post?.youtubeUrl ? getYoutubeEmbedUrl(post.youtubeUrl) : null

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['bottom']}>
      {/* Back */}
      <SafeAreaView edges={['top']} style={[styles.topBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" numberOfLines={1} style={styles.topTitle}>
          {post?.title ?? 'Video'}
        </Text>
        {isAuction && (
          <View style={[styles.livePill, { backgroundColor: isLive ? Colors.destructive : C.secondary, borderColor: isLive ? Colors.destructive : C.border }]}>
            <View style={[styles.liveDot, { backgroundColor: isLive ? '#fff' : C.muted }]} />
            <Text variant="label" style={{ color: isLive ? '#fff' : C.muted, fontSize: 10 }}>
              {isLive ? 'EN VIVO' : 'PRÓXIMO'}
            </Text>
          </View>
        )}
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video player */}
        <View style={styles.playerContainer}>
          {loading ? (
            <View style={[styles.playerPlaceholder, { backgroundColor: C.secondary }]}>
              <Ionicons name="videocam-outline" size={40} color={C.muted} />
            </View>
          ) : embedUrl ? (
            <WebView
              source={{ uri: embedUrl }}
              style={styles.player}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          ) : (
            <View style={[styles.playerPlaceholder, { backgroundColor: C.secondary }]}>
              <Ionicons name="play-circle-outline" size={48} color={C.muted} />
              <Text variant="body" color={C.muted} style={{ marginTop: Spacing[2] }}>
                {isAuction ? 'Transmisión pendiente de confirmación' : 'Video no disponible'}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        {post && (
          <View style={styles.info}>
            {/* Categoría */}
            <Badge variant={post.category}>{categoryLabel(post.category)}</Badge>

            {/* Título */}
            <Text variant="title" weight="bold" family="poppins" style={styles.videoTitle}>
              {post.title}
            </Text>

            {/* Meta */}
            <View style={[styles.metaRow, { borderBottomColor: C.border }]}>
              <View style={styles.metaItem}>
                <Ionicons name="business-outline" size={15} color={C.muted} />
                <Text variant="caption" color={C.muted}>{post.source}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={15} color={C.muted} />
                <Text variant="caption" color={C.muted}>{formatDate(post.publishedAt)}</Text>
              </View>
            </View>

            {/* Descripción / resumen */}
            {post.summary ? (
              <View style={styles.section}>
                <Text variant="caption" weight="semibold" color={C.muted} style={styles.sectionTitle}>
                  DESCRIPCIÓN
                </Text>
                <Text variant="body" style={{ lineHeight: 24, color: C.foreground }}>
                  {post.summary}
                </Text>
              </View>
            ) : null}

            {/* Contenido completo si hay */}
            {post.content && post.content !== post.summary ? (
              <View style={styles.section}>
                {post.content.split('\n\n').map((p, i) => (
                  <Text key={i} variant="body" style={{ lineHeight: 26, color: C.foreground }}>
                    {p}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* Próximo remate */}
            {isAuction && post.startsAt && post.auctionStatus === 'upcoming' && (
              <View style={[styles.scheduledBox, { backgroundColor: `${Colors.lime}15`, borderColor: `${Colors.lime}40` }]}>
                <Ionicons name="calendar" size={20} color={Colors.lime} />
                <View>
                  <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>FECHA DEL REMATE</Text>
                  <Text variant="body" weight="bold">{formatDate(post.startsAt)}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    gap: Spacing[3],
  },
  backBtn: { padding: Spacing[1] },
  topTitle: { flex: 1 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  player: { flex: 1 },
  playerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  info: {
    padding: Spacing[5],
    gap: Spacing[4],
  },
  videoTitle: { lineHeight: 32 },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing[5],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  section: { gap: Spacing[2] },
  sectionTitle: { letterSpacing: 0.6, marginBottom: Spacing[1] },
  scheduledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Radius.base,
    borderWidth: 1,
  },
})
