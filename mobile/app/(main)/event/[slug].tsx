import { useEffect, useState } from 'react'
import {
  View, ScrollView, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Linking, Share,
} from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Text } from '@/components/ui/Text'
import { ReminderModal } from '@/components/ui/ReminderModal'
import { NewsCard } from '@/components/home/NewsCard'
import { fetchEventBySlug, fetchEventSchedule, fetchPostsByEventTag } from '@/lib/supabase-repositories'
import { isNewsContent } from '@/lib/feed-utils'
import { Colors } from '@/constants/colors'
import type { AgroEvent, EventScheduleItem, Post } from '@/lib/types'

const R = Colors.redesign
const REMINDED_EVENTS_KEY = '@agroconecta:reminded_events'

type HubTab = 'info' | 'programa' | 'noticias'

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

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntilEvent(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(dateStr + 'T00:00:00')
  eventDate.setHours(0, 0, 0, 0)
  return Math.floor((eventDate.getTime() - today.getTime()) / 86_400_000)
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
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [tab, setTab] = useState<HubTab>('info')

  // Limpiar estado anterior al cambiar slug para evitar pestañeo
  useEffect(() => {
    if (!slug) return
    setEvent(null)
    setSchedule([])
    setRelatedPosts([])
    setTab('info')
    setLoading(true)
    fetchEventBySlug(slug)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
    getRemindedEvents().then((reminded) => setAlreadyReminded(reminded.includes(slug)))
    fetchEventSchedule(slug).then(setSchedule).catch(() => setSchedule([]))
    fetchPostsByEventTag(slug).then((posts) => setRelatedPosts(posts.filter(isNewsContent))).catch(() => setRelatedPosts([]))
  }, [slug])

  const tabs: { key: HubTab; label: string }[] = [
    { key: 'info', label: 'Info' },
    ...(schedule.length > 0 ? [{ key: 'programa' as HubTab, label: 'Programa' }] : []),
    ...(relatedPosts.length > 0 ? [{ key: 'noticias' as HubTab, label: 'Noticias' }] : []),
  ]
  const showTabs = tabs.length > 1

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
  const showReminder = days >= 2

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />

      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText} numberOfLines={1}>
            Evento
          </Text>
          <TouchableOpacity onPress={handleShare} hitSlop={12}>
            <Ionicons name="share-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Ionicons name="calendar-outline" size={52} color={Colors.lime} />
          </View>
        )}

        <View style={styles.content}>
          {event.category && (
            <View style={styles.chip}>
              <Text family="noto-sans" weight="bold" size={10} color={R.limeSoftText} style={styles.chipText}>
                {event.category.toUpperCase()}
              </Text>
            </View>
          )}

          <Text family="noto-sans" weight="extrabold" size={21} lineHeight={27} color={R.foreground} style={styles.title}>
            {event.title}
          </Text>

          <View style={styles.metaCard}>
            <MetaRow icon="calendar-outline" text={formatFullDate(event.date)} />
            {event.endDate && event.endDate !== event.date && (
              <MetaRow icon="calendar-clear-outline" text={`Hasta: ${formatFullDate(event.endDate)}`} />
            )}
            {event.time && <MetaRow icon="time-outline" text={event.time} />}
            <MetaRow
              icon="location-outline"
              text={[event.location, event.city, event.department].filter(Boolean).join(' · ')}
            />
          </View>

          {showTabs && (
            <View style={styles.tabBar}>
              {tabs.map((t) => {
                const active = tab === t.key
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tabItem, active && styles.tabItemActive]}
                    onPress={() => setTab(t.key)}
                    activeOpacity={0.85}
                  >
                    <Text family="noto-sans" weight="semibold" size={12.5} color={active ? '#FFFFFF' : R.mutedForeground}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {tab === 'info' && (
            <View style={styles.tabContent}>
              {(event.longDescription ?? event.description) ? (
                <Text family="noto-sans" size={13.5} lineHeight={21} color="#43434D">
                  {event.longDescription ?? event.description}
                </Text>
              ) : null}

              {showReminder && (
                <TouchableOpacity
                  style={[
                    styles.remindBtn,
                    alreadyReminded && styles.remindBtnDone,
                    reminding && styles.remindBtnDisabled,
                  ]}
                  activeOpacity={alreadyReminded ? 1 : 0.85}
                  onPress={handleReminder}
                  disabled={reminding || alreadyReminded}
                >
                  {reminding ? (
                    <ActivityIndicator color="#0A0A13" size="small" />
                  ) : (
                    <Ionicons
                      name={alreadyReminded ? 'checkmark-circle' : 'notifications-outline'}
                      size={19}
                      color={alreadyReminded ? R.mutedForeground : '#0A0A13'}
                    />
                  )}
                  <Text family="noto-sans" weight="bold" size={13.5} color={alreadyReminded ? R.mutedForeground : '#0A0A13'}>
                    {reminding ? 'Programando…' : alreadyReminded ? 'Ya agendaste este evento' : 'Recordar este evento'}
                  </Text>
                </TouchableOpacity>
              )}

              {event.importantLinks && event.importantLinks.length > 0 && (
                <View style={styles.linksBlock}>
                  <Text family="noto-sans" weight="semibold" size={13} color={R.foreground}>Links de interés</Text>
                  {event.importantLinks.map((link, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.linkRow}
                      onPress={() => Linking.openURL(link.url)}
                    >
                      <Ionicons name="link-outline" size={15} color={Colors.lime} />
                      <Text family="noto-sans" size={13} color={Colors.lime} numberOfLines={1} style={{ flex: 1 }}>{link.label}</Text>
                      <Ionicons name="open-outline" size={13} color={R.mutedForeground} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(event.contactEmail || event.contactPhone) && (
                <View style={styles.contactCard}>
                  <Text family="noto-sans" weight="semibold" size={10.5} color={R.mutedForeground} style={styles.contactLabel}>CONTACTO</Text>
                  {event.contactEmail && (
                    <TouchableOpacity onPress={() => Linking.openURL(`mailto:${event.contactEmail}`)}>
                      <Text family="noto-sans" size={13} color={Colors.lime}>{event.contactEmail}</Text>
                    </TouchableOpacity>
                  )}
                  {event.contactPhone && (
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${event.contactPhone}`)}>
                      <Text family="noto-sans" size={13} color={R.foreground}>{event.contactPhone}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {event.mapsUrl && (
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => Linking.openURL(event.mapsUrl!)}
                >
                  <Ionicons name="map-outline" size={17} color={R.foreground} />
                  <Text family="noto-sans" weight="medium" size={13} color={R.foreground}>Ver en el mapa</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {tab === 'programa' && (
            <View style={styles.programaWrap}>
              {schedule.map((item, i) => {
                const showDayLabel = item.dayLabel && (i === 0 || schedule[i - 1].dayLabel !== item.dayLabel)
                return (
                  <View key={item.id}>
                    {showDayLabel && (
                      <Text family="noto-sans" weight="semibold" size={11} color={Colors.lime} style={styles.dayLabel}>
                        {item.dayLabel!.toUpperCase()}
                      </Text>
                    )}
                    <View style={styles.scheduleCard}>
                      {item.time && (
                        <Text family="noto-sans" weight="semibold" size={11.5} color={Colors.lime}>{item.time}</Text>
                      )}
                      <Text family="noto-sans" weight="semibold" size={13.5} color={R.foreground}>{item.title}</Text>
                      {item.speaker && (
                        <Text family="noto-sans" size={11.5} color={R.mutedForeground}>{item.speaker}</Text>
                      )}
                      {item.description && (
                        <Text family="noto-sans" size={12.5} lineHeight={19} color={R.mutedForeground}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {tab === 'noticias' && (
            <View style={styles.noticiasWrap}>
              {relatedPosts.map((post) => (
                <NewsCard key={post.id} article={post} onPress={() => router.push(`/article/${post.id}`)} />
              ))}
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

function MetaRow({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={15} color={Colors.lime} />
      <Text family="noto-sans" size={13} color={R.foreground} style={{ flex: 1 }}>{text}</Text>
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
  },
  hero: { width: '100%', height: 220 },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: R.secondary },
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 18 },
  chip: { alignSelf: 'flex-start', backgroundColor: R.limeSoftBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { letterSpacing: 0.5 },
  title: {},
  metaCard: { gap: 12, padding: 16, borderRadius: 16, backgroundColor: R.secondary },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: R.secondary,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabItemActive: { backgroundColor: R.foreground },
  tabContent: { gap: 16 },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.lime,
    borderRadius: 16,
    paddingVertical: 15,
  },
  remindBtnDisabled: { opacity: 0.6 },
  remindBtnDone: { backgroundColor: R.secondary },
  linksBlock: { gap: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: R.divider,
  },
  contactCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: R.secondary,
    gap: 4,
  },
  contactLabel: { letterSpacing: 0.5, marginBottom: 2 },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: R.border,
    borderRadius: 14,
    paddingVertical: 13,
  },
  programaWrap: { gap: 12 },
  dayLabel: { letterSpacing: 0.5, marginBottom: 6 },
  scheduleCard: {
    gap: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: R.secondary,
  },
  noticiasWrap: { gap: 12 },
})
