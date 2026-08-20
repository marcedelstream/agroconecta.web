import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, ScrollView, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Linking, Share,
  type LayoutChangeEvent,
} from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Text } from '@/components/ui/Text'
import { ReminderModal } from '@/components/ui/ReminderModal'
import { fetchEventBySlug, fetchEventSchedule, fetchEventMedia, fetchPostsByEventTag } from '@/lib/supabase-repositories'
import { isNewsContent } from '@/lib/feed-utils'
import { Colors } from '@/constants/colors'
import type { AgroEvent, EventMedia, EventScheduleItem, Post } from '@/lib/types'

const R = Colors.redesign
const REMINDED_EVENTS_KEY = '@agroconecta:reminded_events'

type JumpKey = 'info' | 'programa' | 'noticias'
type IconName = React.ComponentProps<typeof Ionicons>['name']

async function getRemindedEvents(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(REMINDED_EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function markEventReminded(slug: string) {
  const current = await getRemindedEvents()
  if (current.includes(slug)) return
  await AsyncStorage.setItem(REMINDED_EVENTS_KEY, JSON.stringify([...current, slug])).catch(() => {})
}

function daysUntilEvent(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(dateStr + 'T00:00:00')
  eventDate.setHours(0, 0, 0, 0)
  return Math.floor((eventDate.getTime() - today.getTime()) / 86_400_000)
}

function countdownLabel(days: number, hasEndDate: boolean, endDays: number): string | null {
  if (days > 1) return `Faltan ${days} días`
  if (days === 1) return 'Mañana'
  if (days === 0) return 'Hoy'
  if (hasEndDate && endDays >= 0) return 'En curso'
  return null
}

function daysBetweenInclusive(dateStr: string, endDateStr?: string): number {
  if (!endDateStr || endDateStr === dateStr) return 1
  const start = new Date(dateStr + 'T00:00:00')
  const end = new Date(endDateStr + 'T00:00:00')
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDateRange(dateStr: string, endDateStr?: string): string {
  const start = new Date(dateStr + 'T00:00:00')
  const monthName = (d: Date) => d.toLocaleDateString('es-PY', { month: 'long' })
  if (!endDateStr || endDateStr === dateStr) return `${start.getDate()} de ${monthName(start)}`
  const end = new Date(endDateStr + 'T00:00:00')
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} al ${end.getDate()} de ${monthName(start)}`
  }
  return `${start.getDate()} de ${monthName(start)} al ${end.getDate()} de ${monthName(end)}`
}

function formatWeekdayRange(dateStr: string, endDateStr?: string): string {
  const start = new Date(dateStr + 'T00:00:00')
  const weekday = (d: Date) => d.toLocaleDateString('es-PY', { weekday: 'long' })
  if (!endDateStr || endDateStr === dateStr) return capitalize(weekday(start))
  const end = new Date(endDateStr + 'T00:00:00')
  return `${capitalize(weekday(start))} a ${weekday(end)}`
}

function monthAbbrev(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-PY', { month: 'short' }).replace('.', '').toUpperCase()
}

function dayNumber(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDate()
}

function speakerInitials(speaker: string): string {
  const cleaned = speaker.replace(/^(Ing\.|Dra?\.|Lic\.|Modera)\s*/i, '').trim()
  const letters = cleaned.split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase())
  return letters.join('') || '·'
}

async function scheduleReminder(event: AgroEvent) {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('Permisos necesarios', 'Activá las notificaciones en ajustes del dispositivo para recibir recordatorios.')
    return false
  }
  const reminderDate = new Date(event.date + 'T09:00:00')
  reminderDate.setDate(reminderDate.getDate() - 1)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 Mañana: ' + event.title,
      body: `${event.city ?? event.location}${event.time ? ' · ' + event.time : ''}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  })
  return true
}

export default function EventDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [event, setEvent] = useState<AgroEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [reminding, setReminding] = useState(false)
  const [alreadyReminded, setAlreadyReminded] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDateLabel, setModalDateLabel] = useState('')
  const [schedule, setSchedule] = useState<EventScheduleItem[]>([])
  const [media, setMedia] = useState<EventMedia | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [selectedDay, setSelectedDay] = useState('')

  const scrollRef = useRef<ScrollView>(null)
  const contentTop = useRef(0)
  const sectionOffsets = useRef<Partial<Record<JumpKey, number>>>({})

  // Limpiar estado anterior al cambiar slug para evitar pestañeo
  useEffect(() => {
    if (!slug) return
    setEvent(null)
    setSchedule([])
    setMedia(null)
    setRelatedPosts([])
    setSelectedDay('')
    setLoading(true)
    fetchEventBySlug(slug)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
    getRemindedEvents().then((reminded) => setAlreadyReminded(reminded.includes(slug)))
    fetchEventSchedule(slug).then(setSchedule).catch(() => setSchedule([]))
    fetchEventMedia(slug).then(setMedia).catch(() => setMedia(null))
    fetchPostsByEventTag(slug).then((posts) => setRelatedPosts(posts.filter(isNewsContent))).catch(() => setRelatedPosts([]))
  }, [slug])

  const dayLabels = useMemo(() => {
    const seen = new Set<string>()
    const labels: string[] = []
    for (const item of schedule) {
      const label = item.dayLabel ?? ''
      if (!seen.has(label)) { seen.add(label); labels.push(label) }
    }
    return labels
  }, [schedule])

  useEffect(() => {
    if (dayLabels.length > 0 && !dayLabels.includes(selectedDay)) setSelectedDay(dayLabels[0])
  }, [dayLabels, selectedDay])

  const filteredSchedule = useMemo(
    () => schedule.filter((item) => (item.dayLabel ?? '') === selectedDay),
    [schedule, selectedDay]
  )

  const jumpLinks: { key: JumpKey; label: string }[] = [
    { key: 'info', label: 'Info' },
    ...(schedule.length > 0 ? [{ key: 'programa' as JumpKey, label: 'Programa' }] : []),
    ...(relatedPosts.length > 0 ? [{ key: 'noticias' as JumpKey, label: 'Noticias' }] : []),
  ]

  function jumpTo(key: JumpKey) {
    const y = sectionOffsets.current[key]
    if (y === undefined) return
    scrollRef.current?.scrollTo({ y: contentTop.current + y - 16, animated: true })
  }

  function registerSection(key: JumpKey) {
    return (e: LayoutChangeEvent) => { sectionOffsets.current[key] = e.nativeEvent.layout.y }
  }

  const handleReminder = async () => {
    if (!event || alreadyReminded) return
    setReminding(true)
    try {
      const ok = await scheduleReminder(event)
      if (ok) {
        await markEventReminded(event.slug)
        setAlreadyReminded(true)
        const reminderDate = new Date(event.date + 'T00:00:00')
        reminderDate.setDate(reminderDate.getDate() - 1)
        const label = reminderDate.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })
        setModalDateLabel(label)
        setModalVisible(true)
      }
    } finally {
      setReminding(false)
    }
  }

  async function handleShare() {
    if (!event) return
    await Share.share({
      message: `${event.title}\n\nhttps://eventosagropy.com/eventos/${event.slug}`,
      url: `https://eventosagropy.com/eventos/${event.slug}`,
    })
  }

  if (loading) {
    return (
      <View style={[styles.centerFill, { backgroundColor: R.surface }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <ActivityIndicator color={Colors.lime} size="large" />
      </View>
    )
  }

  if (!event) {
    return (
      <View style={[styles.centerFill, { backgroundColor: R.surface }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <Ionicons name="alert-circle-outline" size={40} color={R.mutedForeground} />
        <Text family="noto-sans" size={14} color={R.mutedForeground} style={{ marginTop: 12 }}>Evento no encontrado.</Text>
        <TouchableOpacity onPress={() => goBack()} style={{ marginTop: 10 }}>
          <Text family="noto-sans" weight="semibold" size={14} color={Colors.lime}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const days = daysUntilEvent(event.date)
  const endDays = event.endDate ? daysUntilEvent(event.endDate) : days
  const showReminder = days >= 2
  const countdown = countdownLabel(days, Boolean(event.endDate), endDays)
  const totalDays = daysBetweenInclusive(event.date, event.endDate)
  const statsParts = [
    totalDays > 1 ? `${totalDays} días` : null,
    schedule.length > 0 ? `${schedule.length} charla${schedule.length === 1 ? '' : 's'}` : null,
  ].filter((p): p is string => Boolean(p))

  const contactRows: { key: string; icon: IconName; label: string; onPress: () => void; showOpen?: boolean }[] = [
    ...(event.importantLinks ?? []).map((link, i) => ({
      key: `link-${i}`,
      icon: 'link-outline' as IconName,
      label: link.label,
      onPress: () => Linking.openURL(link.url),
      showOpen: true,
    })),
    ...(event.contactEmail ? [{ key: 'email', icon: 'mail-outline' as IconName, label: event.contactEmail, onPress: () => Linking.openURL(`mailto:${event.contactEmail}`) }] : []),
    ...(event.contactPhone ? [{ key: 'phone', icon: 'call-outline' as IconName, label: event.contactPhone, onPress: () => Linking.openURL(`tel:${event.contactPhone}`) }] : []),
  ]

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />

      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color="#FFFFFF" numberOfLines={1} style={styles.headerTitle}>
            {event.title}
          </Text>
          <TouchableOpacity onPress={handleShare} hitSlop={12}>
            <Ionicons name="share-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {jumpLinks.length > 1 && (
          <View style={styles.jumpRow}>
            {jumpLinks.map((link) => (
              <TouchableOpacity key={link.key} style={styles.jumpChip} onPress={() => jumpTo(link.key)} activeOpacity={0.8}>
                <Text family="noto-sans" weight="semibold" size={12} color={Colors.lime}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroWrap}>
          <View style={styles.heroInner}>
            {media?.bannerImageUrl || event.imageUrl ? (
              <Image source={{ uri: media?.bannerImageUrl ?? event.imageUrl }} style={styles.hero} resizeMode="cover" />
            ) : (
              <View style={[styles.hero, styles.heroPlaceholder]}>
                <Ionicons name="calendar-outline" size={40} color={Colors.lime} />
              </View>
            )}
            {countdown && (
              <View style={styles.countdownBadge}>
                <View style={styles.countdownDot} />
                <Text family="noto-sans" weight="bold" size={11.5} color="#FFFFFF">{countdown}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content} onLayout={(e) => { contentTop.current = e.nativeEvent.layout.y }}>
          <View onLayout={registerSection('info')}>
            <View style={styles.categoryRow}>
              {event.category && (
                <View style={styles.chip}>
                  <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.chipText}>
                    {event.category.toUpperCase()}
                  </Text>
                </View>
              )}
              {statsParts.length > 0 && (
                <Text family="noto-sans" size={11.5} color={R.mutedForeground2}>{statsParts.join(' · ')}</Text>
              )}
            </View>

            <Text family="noto-sans" weight="extrabold" size={26} lineHeight={31} color={R.foreground} style={styles.title}>
              {event.title}
            </Text>

            <View style={[styles.metaBlock, styles.metaBlockNoSubtitle]}>
              <View style={styles.metaRow}>
                <View style={styles.dateBadge}>
                  <Text family="noto-sans" weight="bold" size={8.5} color={R.mutedForeground} style={styles.dateBadgeMonth}>
                    {monthAbbrev(event.date)}
                  </Text>
                  <View style={styles.dateBadgeDay}>
                    <Text family="noto-sans" weight="bold" size={16} color={R.foreground}>{dayNumber(event.date)}</Text>
                  </View>
                </View>
                <View style={styles.metaTextCol}>
                  <Text family="noto-sans" weight="semibold" size={14} color={R.foreground}>
                    {formatDateRange(event.date, event.endDate)}
                  </Text>
                  <Text family="noto-sans" size={12.5} color={R.mutedForeground}>
                    {[formatWeekdayRange(event.date, event.endDate), event.time].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.metaRow}
                activeOpacity={event.mapsUrl ? 0.7 : 1}
                onPress={() => { if (event.mapsUrl) Linking.openURL(event.mapsUrl) }}
                disabled={!event.mapsUrl}
              >
                <View style={styles.metaIconBox}>
                  <Ionicons name="location-outline" size={19} color={R.foreground} />
                </View>
                <View style={styles.metaTextCol}>
                  <Text family="noto-sans" weight="semibold" size={14} color={R.foreground}>{event.location}</Text>
                  {(event.city || event.department) && (
                    <Text family="noto-sans" size={12.5} color={R.mutedForeground}>
                      {[event.city, event.department].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
                {event.mapsUrl && <Ionicons name="chevron-forward" size={16} color={R.mutedForeground2} />}
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              {showReminder && (
                <TouchableOpacity
                  style={[styles.reminderBtn, alreadyReminded && styles.reminderBtnDone]}
                  activeOpacity={alreadyReminded ? 1 : 0.85}
                  onPress={handleReminder}
                  disabled={reminding || alreadyReminded}
                >
                  {reminding ? (
                    <ActivityIndicator color="#0A0A13" size="small" />
                  ) : (
                    <Ionicons name={alreadyReminded ? 'checkmark-circle' : 'notifications-outline'} size={16} color="#0A0A13" />
                  )}
                  <Text family="noto-sans" weight="bold" size={13.5} color="#0A0A13">
                    {alreadyReminded ? 'Ya agendado' : 'Recordarme'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={showReminder ? styles.shareBtnSquare : styles.shareBtnWide}
                activeOpacity={0.85}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={18} color={R.foreground} />
                {!showReminder && (
                  <Text family="noto-sans" weight="bold" size={13.5} color={R.foreground}>Compartir evento</Text>
                )}
              </TouchableOpacity>
            </View>

            {event.longDescription && (
              <>
                <View style={styles.divider} />
                <Text family="noto-sans" size={14} lineHeight={22} color="#43434D">{event.longDescription}</Text>
              </>
            )}
          </View>

          {schedule.length > 0 && (
            <View onLayout={registerSection('programa')}>
              <View style={styles.divider} />
              <View style={styles.sectionHeaderRow}>
                <Text family="noto-sans" weight="extrabold" size={17} color={R.foreground}>Programa</Text>
                {dayLabels.length > 1 && (
                  <View style={styles.dayChipsRow}>
                    {dayLabels.map((label) => {
                      const active = label === selectedDay
                      return (
                        <TouchableOpacity
                          key={label || 'sin-dia'}
                          style={[styles.dayChip, active && styles.dayChipActive]}
                          onPress={() => setSelectedDay(label)}
                          activeOpacity={0.8}
                        >
                          <Text family="noto-sans" weight={active ? 'bold' : 'semibold'} size={11.5} color={active ? '#0A0A13' : R.mutedForeground2} numberOfLines={1}>
                            {label || 'Programa'}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
              </View>

              <View>
                {filteredSchedule.map((item, i) => (
                  <View key={item.id} style={[styles.scheduleRow, i === filteredSchedule.length - 1 && styles.scheduleRowLast]}>
                    <Text family="noto-sans" weight="bold" size={12.5} color={R.foreground} style={styles.scheduleTime}>
                      {item.time ?? ''}
                    </Text>
                    <View style={styles.scheduleBody}>
                      <Text family="noto-sans" weight="bold" size={14.5} lineHeight={19} color={R.foreground}>{item.title}</Text>
                      {item.speaker && (
                        <View style={styles.speakerRow}>
                          <View style={styles.speakerAvatar}>
                            <Text family="noto-sans" weight="bold" size={9.5} color={R.limeSoftText}>{speakerInitials(item.speaker)}</Text>
                          </View>
                          <Text family="noto-sans" size={12.5} color="#43434D" numberOfLines={1} style={{ flex: 1 }}>{item.speaker}</Text>
                        </View>
                      )}
                      {item.description && (
                        <Text family="noto-sans" size={13} lineHeight={19} color={R.mutedForeground}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />
          <View>
            <Text family="noto-sans" weight="extrabold" size={17} color={R.foreground} style={styles.sectionHeadingSpaced}>Links y contacto</Text>
            {contactRows.length > 0 ? (
              contactRows.map((row, i) => (
                <TouchableOpacity
                  key={row.key}
                  style={[styles.linkRow, i === contactRows.length - 1 && styles.linkRowLast]}
                  onPress={row.onPress}
                >
                  <Ionicons name={row.icon} size={16} color={R.limeSoftText} />
                  <Text family="noto-sans" weight="medium" size={13.5} color={R.foreground} numberOfLines={1} style={{ flex: 1 }}>{row.label}</Text>
                  {row.showOpen && <Ionicons name="open-outline" size={14} color={R.mutedForeground2} />}
                </TouchableOpacity>
              ))
            ) : (
              <Text family="noto-sans" size={13} color={R.mutedForeground}>Sin datos de contacto cargados todavía.</Text>
            )}
          </View>

          {relatedPosts.length > 0 && (
            <View onLayout={registerSection('noticias')}>
              <View style={styles.divider} />
              <Text family="noto-sans" weight="extrabold" size={17} color={R.foreground} style={styles.sectionHeadingSpaced}>Noticias</Text>
              <View>
                {relatedPosts.map((post, i) => (
                  <TouchableOpacity
                    key={post.id}
                    style={[styles.newsRow, i === relatedPosts.length - 1 && styles.newsRowLast]}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/article/${post.id}`)}
                  >
                    {post.imageUrl ? (
                      <Image source={{ uri: post.imageUrl }} style={styles.newsThumb} resizeMode="cover" />
                    ) : (
                      <View style={[styles.newsThumb, styles.newsThumbPlaceholder]}>
                        <Ionicons name="newspaper-outline" size={18} color={Colors.lime} />
                      </View>
                    )}
                    <View style={styles.newsBody}>
                      <Text family="noto-sans" weight="bold" size={14} lineHeight={19} color={R.foreground} numberOfLines={2}>
                        {post.title}
                      </Text>
                      <Text family="noto-sans" size={12} color={R.mutedForeground} numberOfLines={1}>{post.source}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={R.mutedForeground2} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <ReminderModal
        visible={modalVisible}
        eventTitle={event.title}
        reminderDateLabel={modalDateLabel}
        onClose={() => setModalVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  jumpRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  jumpChip: {
    borderWidth: 1,
    borderColor: 'rgba(164,210,51,0.4)',
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  heroWrap: { paddingHorizontal: 16, paddingTop: 16 },
  heroInner: { position: 'relative', borderRadius: 18, overflow: 'hidden' },
  hero: { width: '100%', height: 168 },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: R.secondary },
  countdownBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10,23,32,0.82)',
    borderRadius: 9999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  countdownDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.lime },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { alignSelf: 'flex-start', backgroundColor: R.limeSoftBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { letterSpacing: 0.5 },
  title: { marginTop: 14, letterSpacing: -0.6 },
  metaBlock: { marginTop: 16, gap: 14 },
  metaBlockNoSubtitle: { marginTop: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaTextCol: { flex: 1, gap: 2 },
  dateBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.border,
    overflow: 'hidden',
  },
  dateBadgeMonth: { backgroundColor: R.secondary, textAlign: 'center', letterSpacing: 0.6, paddingVertical: 2 },
  dateBadgeDay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metaIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.border,
    backgroundColor: R.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  reminderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Colors.lime,
    borderRadius: 14,
    paddingVertical: 14,
  },
  reminderBtnDone: { backgroundColor: '#D9D9DE' },
  shareBtnSquare: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: R.border,
    borderRadius: 14,
  },
  shareBtnWide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: R.border,
    borderRadius: 14,
    paddingVertical: 14,
  },
  divider: { height: 1, backgroundColor: R.divider, marginVertical: 18 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionHeadingSpaced: { marginBottom: 14 },
  dayChipsRow: { flexDirection: 'row', gap: 6 },
  dayChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  dayChipActive: { backgroundColor: R.limeSoftBg },
  scheduleRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: R.divider,
  },
  scheduleRowLast: { borderBottomWidth: 0 },
  scheduleTime: { width: 44 },
  scheduleBody: { flex: 1, gap: 6 },
  speakerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  speakerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: R.limeSoftBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: R.divider,
  },
  linkRowLast: { borderBottomWidth: 0 },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: R.divider,
  },
  newsRowLast: { borderBottomWidth: 0 },
  newsThumb: { width: 56, height: 56, borderRadius: 12 },
  newsThumbPlaceholder: { backgroundColor: R.secondary, alignItems: 'center', justifyContent: 'center' },
  newsBody: { flex: 1, gap: 3 },
})
