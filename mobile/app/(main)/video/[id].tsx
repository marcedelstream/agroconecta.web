import { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Image, useWindowDimensions, ActivityIndicator, Alert, Share, StyleSheet } from 'react-native'
import YoutubePlayer from 'react-native-youtube-iframe'
import { useLocalSearchParams, router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { Text } from '@/components/ui/Text'
import { ReminderModal } from '@/components/ui/ReminderModal'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { mockPublishers } from '@/lib/mock-data'
import { fetchPublishedPostBySlug, fetchOrganizationById, fetchPostsByOrganization, fetchPublishedPosts } from '@/lib/supabase-repositories'
import type { Organization, Post } from '@/lib/types'

const R = Colors.redesign

function formatDate(date: Date) {
  return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function videoDuration(post: Post) {
  if (post.contentType === 'auction') return post.auctionStatus === 'live' ? 'En vivo' : 'Próximo'
  return `${post.readTime} min`
}

function getYoutubeVideoId(url: string): string | null {
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
    content: { title: '📅 Mañana: ' + post.title, body: post.source },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
  })
  return true
}

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, updateUser } = useApp()
  const [post, setPost] = useState<Post | null>(null)
  const [publisher, setPublisher] = useState<Organization | null>(null)
  const [channelVideoCount, setChannelVideoCount] = useState<number | null>(null)
  const [upNext, setUpNext] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [reminding, setReminding] = useState(false)
  const [reminderModalVisible, setReminderModalVisible] = useState(false)
  const [reminderDateLabel, setReminderDateLabel] = useState('')
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
    setChannelVideoCount(null)
    if (!post?.publisherId) return
    let mounted = true
    fetchOrganizationById(post.publisherId)
      .then((org) => { if (mounted) setPublisher(org ?? mockPublishers.find((p) => p.id === post.publisherId) ?? null) })
      .catch(() => { if (mounted) setPublisher(mockPublishers.find((p) => p.id === post.publisherId) ?? null) })
    fetchPostsByOrganization(post.publisherId)
      .then((posts) => { if (mounted) setChannelVideoCount(posts.filter((p) => p.contentType === 'video' || p.contentType === 'auction').length) })
      .catch(() => {})
    return () => { mounted = false }
  }, [post?.publisherId])

  useEffect(() => {
    if (!post) return
    fetchPublishedPosts()
      .then((posts) => {
        const others = posts.filter((p) => p.id !== post.id && (p.contentType === 'video' || p.contentType === 'auction'))
        setUpNext(others.slice(0, 5))
      })
      .catch(() => setUpNext([]))
  }, [post])

  const isLive = post?.auctionStatus === 'live'
  const isAuction = post?.contentType === 'auction'
  const videoId = post?.youtubeUrl ? getYoutubeVideoId(post.youtubeUrl) : null
  const showReminder = isAuction && post?.startsAt && post.auctionStatus === 'upcoming' && daysUntil(post.startsAt) >= 2
  const isFollowed = user?.organizationSubscriptions?.includes(post?.publisherId ?? '') ?? false

  async function toggleFollow() {
    if (!user || !post?.publisherId) return
    const current = user.organizationSubscriptions ?? []
    const updated = isFollowed ? current.filter((x) => x !== post.publisherId) : [...current, post.publisherId]
    await updateUser({ organizationSubscriptions: updated, mediaPreferences: updated })
  }

  async function handleShare() {
    if (!post) return
    await Share.share({ message: `${post.title}\n\nMirá en Agroconecta`, url: `https://agroconecta.com.py/noticias/${post.slug ?? post.id}` })
  }

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
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText} numberOfLines={1}>
              Video
            </Text>
            {isAuction && (
              <View style={[styles.livePill, { backgroundColor: isLive ? R.alert : 'transparent', borderColor: isLive ? R.alert : R.header.chipBorder }]}>
                <Text family="noto-sans" weight="bold" size={9} color={isLive ? '#FFFFFF' : R.header.mutedText}>
                  {isLive ? 'EN VIVO' : 'PRÓXIMO'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleShare} hitSlop={12}>
            <Ionicons name="share-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={[styles.playerContainer, { height: playerHeight }]}>
        {loading ? (
          <View style={styles.playerPlaceholder}>
            <Ionicons name="videocam-outline" size={40} color="#5A5A66" />
          </View>
        ) : videoId ? (
          <YoutubePlayer height={playerHeight} videoId={videoId} play />
        ) : (
          <View style={styles.playerPlaceholder}>
            <Ionicons name="play-circle-outline" size={48} color="#5A5A66" />
            <Text family="noto-sans" size={13} color="#8C8C99" style={{ marginTop: 8 }}>
              {isAuction ? 'Transmisión pendiente de confirmación' : 'Video no disponible'}
            </Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {post && (
          <View style={styles.content}>
            <Text family="noto-sans" weight="bold" size={18} lineHeight={24} color={R.foreground}>
              {post.title}
            </Text>
            <Text family="noto-sans" size={11.5} color={R.mutedForeground} style={styles.dateLabel}>
              {formatDate(post.publishedAt)}
            </Text>

            <TouchableOpacity
              style={styles.channelRow}
              activeOpacity={publisher ? 0.8 : 1}
              onPress={() => publisher && router.push(`/publisher/${publisher.id}`)}
            >
              {publisher?.logoUrl ? (
                <Image source={{ uri: publisher.logoUrl }} style={styles.channelAvatarImage} />
              ) : (
                <View style={styles.channelAvatar}>
                  <Text family="noto-sans" weight="bold" size={12} color={R.foreground}>{initials(post.source)}</Text>
                </View>
              )}
              <View style={styles.channelText}>
                <Text family="noto-sans" weight="semibold" size={13} color={R.foreground}>{post.source}</Text>
                {channelVideoCount !== null && (
                  <Text family="noto-sans" size={11} color={R.mutedForeground}>{channelVideoCount} videos</Text>
                )}
              </View>
              {post.publisherId && (
                <TouchableOpacity
                  style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                  onPress={toggleFollow}
                  activeOpacity={0.8}
                >
                  <Text family="noto-sans" weight="semibold" size={11.5} color={isFollowed ? '#FFFFFF' : R.foreground}>
                    {isFollowed ? 'Siguiendo' : 'Seguir'}
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {post.summary ? (
              <Text family="noto-sans" size={13.5} lineHeight={21} color="#43434D" style={styles.description}>
                {post.summary}
              </Text>
            ) : null}

            {isAuction && post.startsAt && post.auctionStatus === 'upcoming' && (
              <View style={styles.auctionSection}>
                <View style={styles.scheduledBox}>
                  <Ionicons name="calendar" size={20} color={Colors.lime} />
                  <View>
                    <Text family="noto-sans" weight="semibold" size={11} color={Colors.lime} style={styles.scheduledLabel}>
                      FECHA DEL REMATE
                    </Text>
                    <Text family="noto-sans" weight="bold" size={14} color={R.foreground}>
                      {post.startsAt.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                </View>

                {showReminder && (
                  <TouchableOpacity
                    style={[styles.remindBtn, reminding && styles.remindBtnDisabled]}
                    activeOpacity={0.85}
                    onPress={handleReminder}
                    disabled={reminding}
                  >
                    {reminding
                      ? <ActivityIndicator color="#0A0A13" size="small" />
                      : <Ionicons name="notifications-outline" size={20} color="#0A0A13" />}
                    <Text family="noto-sans" weight="bold" size={14} color="#0A0A13">
                      {reminding ? 'Programando…' : 'Recordarme este remate'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {upNext.length > 0 && (
          <View style={styles.upNextWrap}>
            <Text family="noto-sans" weight="bold" size={15} color={R.foreground} style={styles.upNextTitle}>
              A continuación
            </Text>
            <View style={styles.upNextCard}>
              {upNext.map((video, i) => (
                <TouchableOpacity
                  key={video.id}
                  style={[styles.upNextRow, i < upNext.length - 1 && styles.upNextRowDivider]}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/(main)/video/${video.id}` as any)}
                >
                  <View style={styles.upNextThumbWrap}>
                    <Image source={{ uri: video.imageUrl }} style={styles.upNextThumb} resizeMode="cover" />
                    <View style={styles.upNextDurationPill}>
                      <Text family="noto-sans" weight="semibold" size={9} color="#FFFFFF">{videoDuration(video)}</Text>
                    </View>
                  </View>
                  <View style={styles.upNextText}>
                    <Text family="noto-sans" weight="semibold" size={13} lineHeight={17} color={R.foreground} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <Text family="noto-sans" size={11} color={R.mutedForeground} style={styles.upNextChannel}>
                      {video.source}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <ReminderModal
        visible={reminderModalVisible}
        eventTitle={post?.title ?? ''}
        reminderDateLabel={reminderDateLabel}
        onClose={() => setReminderModalVisible(false)}
      />
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
    paddingBottom: 10,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  livePill: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  playerContainer: { width: '100%', backgroundColor: '#000' },
  playerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  dateLabel: { marginTop: 6 },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: R.divider,
  },
  channelAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: R.secondary, alignItems: 'center', justifyContent: 'center' },
  channelAvatarImage: { width: 36, height: 36, borderRadius: 18 },
  channelText: { flex: 1, gap: 1 },
  followBtn: { borderWidth: 1, borderColor: R.border, borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 7 },
  followBtnActive: { backgroundColor: R.foreground, borderColor: R.foreground },
  description: { paddingTop: 14, paddingBottom: 2 },
  auctionSection: { gap: 12, marginTop: 16 },
  scheduledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: `${Colors.lime}15`,
    borderWidth: 1,
    borderColor: `${Colors.lime}40`,
  },
  scheduledLabel: { letterSpacing: 0.4 },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.lime,
    borderRadius: 16,
    paddingVertical: 16,
  },
  remindBtnDisabled: { opacity: 0.6 },
  upNextWrap: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 26 },
  upNextTitle: { marginBottom: 10 },
  upNextCard: { backgroundColor: R.secondary, borderRadius: 16, paddingHorizontal: 14 },
  upNextRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  upNextRowDivider: { borderBottomWidth: 1, borderBottomColor: '#E9E9E2' },
  upNextThumbWrap: { position: 'relative' },
  upNextThumb: { width: 84, height: 52, borderRadius: 9 },
  upNextDurationPill: { position: 'absolute', right: 5, bottom: 5, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  upNextText: { flex: 1, minWidth: 0 },
  upNextChannel: { marginTop: 3 },
})
