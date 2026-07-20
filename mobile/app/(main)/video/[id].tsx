import { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Image, useWindowDimensions, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import YoutubePlayer from 'react-native-youtube-iframe'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/card'
import { ReminderModal } from '@/components/ui/ReminderModal'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { mockPublishers } from '@/lib/mock-data'
import { fetchPublishedPostBySlug, fetchOrganizationById } from '@/lib/supabase-repositories'
import type { Organization, Post } from '@/lib/types'

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function formatDate(date: Date) {
  return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getYoutubeVideoId(url: string): string | null {
  // Cubre: watch?v=, youtu.be/, embed/, shorts/, live/, m.youtube.com y variantes con parámetros extra
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

function daysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - today.getTime()) / 86_400_000)
}

async function scheduleAuctionReminder(post: Post) {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('Permisos necesarios', 'Activá las notificaciones en ajustes del dispositivo para recibir recordatorios.')
    return false
  }
  const reminderDate = new Date(post.startsAt!)
  reminderDate.setDate(reminderDate.getDate() - 1)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 Mañana: ' + post.title,
      body: post.source,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  })
  return true
}

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [publisher, setPublisher] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [reminding, setReminding] = useState(false)
  const [reminderModalVisible, setReminderModalVisible] = useState(false)
  const [reminderDateLabel, setReminderDateLabel] = useState('')
  const C = useColors()
  const { width } = useWindowDimensions()
  const playerHeight = (width * 9) / 16

  useEffect(() => {
    if (!id) return
    let mounted = true
    fetchPublishedPostBySlug(id)
      .then((p) => { if (mounted) setPost(p) })
      .catch(() => { if (mounted) setPost(null) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    setPublisher(null)
    if (!post?.publisherId) return
    let mounted = true
    fetchOrganizationById(post.publisherId)
      .then((org) => { if (mounted) setPublisher(org ?? mockPublishers.find((p) => p.id === post.publisherId) ?? null) })
      .catch(() => { if (mounted) setPublisher(mockPublishers.find((p) => p.id === post.publisherId) ?? null) })
    return () => { mounted = false }
  }, [post?.publisherId])

  const isLive = post?.auctionStatus === 'live'
  const isAuction = post?.contentType === 'auction'
  const videoId = post?.youtubeUrl ? getYoutubeVideoId(post.youtubeUrl) : null
  const showReminder = isAuction && post?.startsAt && post.auctionStatus === 'upcoming' && daysUntil(post.startsAt) >= 2

  async function handleReminder() {
    if (!post?.startsAt) return
    setReminding(true)
    try {
      const ok = await scheduleAuctionReminder(post)
      if (ok) {
        const reminderDate = new Date(post.startsAt)
        reminderDate.setDate(reminderDate.getDate() - 1)
        setReminderDateLabel(reminderDate.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' }))
        setReminderModalVisible(true)
      }
    } finally {
      setReminding(false)
    }
  }

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
        <View style={[styles.playerContainer, { height: playerHeight }]}>
          {loading ? (
            <View style={[styles.playerPlaceholder, { backgroundColor: C.secondary }]}>
              <Ionicons name="videocam-outline" size={40} color={C.muted} />
            </View>
          ) : videoId ? (
            <YoutubePlayer height={playerHeight} videoId={videoId} play />
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
            <View style={[styles.metaBlock, { borderBottomColor: C.border }]}>
              <TouchableOpacity
                activeOpacity={publisher ? 0.8 : 1}
                onPress={() => publisher && router.push(`/publisher/${publisher.id}`)}
              >
                <Card style={styles.sourceCard} padding={3}>
                  <View style={styles.sourceInner}>
                    {publisher?.logoUrl ? (
                      <Image source={{ uri: publisher.logoUrl }} style={styles.sourceAvatarImage} />
                    ) : (
                      <View style={styles.sourceAvatar}>
                        <Ionicons name="business-outline" size={20} color={Colors.lime} />
                      </View>
                    )}
                    <View style={styles.sourceText}>
                      <Text variant="caption" color={C.muted}>Fuente</Text>
                      <View style={styles.sourceNameRow}>
                        <Text variant="body" weight="semibold">{post.source}</Text>
                        {publisher?.isVerified && (
                          <Ionicons name="checkmark-circle" size={16} color={Colors.lime} />
                        )}
                      </View>
                    </View>
                    {publisher && <Ionicons name="chevron-forward" size={18} color={C.muted} />}
                  </View>
                </Card>
              </TouchableOpacity>

              <View style={styles.dateRow}>
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
              <View style={{ gap: Spacing[3] }}>
                <View style={[styles.scheduledBox, { backgroundColor: `${Colors.lime}15`, borderColor: `${Colors.lime}40` }]}>
                  <Ionicons name="calendar" size={20} color={Colors.lime} />
                  <View>
                    <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>FECHA DEL REMATE</Text>
                    <Text variant="body" weight="bold">{formatDate(post.startsAt)}</Text>
                  </View>
                </View>

                {showReminder && (
                  <TouchableOpacity
                    style={[styles.remindBtn, reminding && { opacity: 0.6 }]}
                    activeOpacity={0.85}
                    onPress={handleReminder}
                    disabled={reminding}
                  >
                    {reminding
                      ? <ActivityIndicator color="#0A0A13" size="small" />
                      : <Ionicons name="notifications-outline" size={20} color="#0A0A13" />
                    }
                    <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>
                      {reminding ? 'Programando…' : 'Recordarme este remate'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <ReminderModal
        visible={reminderModalVisible}
        eventTitle={post?.title ?? ''}
        reminderDateLabel={reminderDateLabel}
        onClose={() => setReminderModalVisible(false)}
      />
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
    backgroundColor: '#000',
  },
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
  metaBlock: {
    gap: Spacing[2],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  sourceCard: {},
  sourceInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  sourceNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  sourceAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.lime}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
  },
  sourceText: { flex: 1 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingLeft: Spacing[1],
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
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.lime,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
  },
})
