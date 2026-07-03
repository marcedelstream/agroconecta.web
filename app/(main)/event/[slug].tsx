import { useEffect, useState } from 'react'
import {
  View, ScrollView, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Linking, Share,
} from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { Text } from '@/components/ui/Text'
import { ReminderModal } from '@/components/ui/ReminderModal'
import { NewsCard } from '@/components/home/NewsCard'
import { fetchEventBySlug, fetchEventSchedule, fetchPostsByEventTag } from '@/lib/supabase-repositories'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import type { AgroEvent, EventScheduleItem, Post } from '@/lib/types'

type HubTab = 'info' | 'programa' | 'noticias'

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
  const C = useColors()
  const insets = useSafeAreaInsets()
  const [event, setEvent] = useState<AgroEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [reminding, setReminding] = useState(false)
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
    fetchEventSchedule(slug).then(setSchedule).catch(() => setSchedule([]))
    fetchPostsByEventTag(slug).then(setRelatedPosts).catch(() => setRelatedPosts([]))
  }, [slug])

  const tabs: { key: HubTab; label: string }[] = [
    { key: 'info', label: 'Info' },
    ...(schedule.length > 0 ? [{ key: 'programa' as HubTab, label: 'Programa' }] : []),
    ...(relatedPosts.length > 0 ? [{ key: 'noticias' as HubTab, label: 'Noticias' }] : []),
  ]
  const showTabs = tabs.length > 1

  const handleReminder = async () => {
    if (!event) return
    setReminding(true)
    try {
      const ok = await scheduleReminder(event)
      if (ok) {
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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <ActivityIndicator color={Colors.lime} size="large" />
      </View>
    )
  }

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <Ionicons name="alert-circle-outline" size={48} color={C.muted} />
        <Text variant="body" style={{ color: C.muted, marginTop: Spacing[3] }}>Evento no encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing[2] }}>
          <Text variant="body" style={{ color: Colors.lime }}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const days = daysUntilEvent(event.date)
  const showReminder = days >= 2

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />

      {/* Botón volver */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + Spacing[2] }]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Ionicons name="arrow-back" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Botón compartir */}
      <TouchableOpacity
        style={[styles.floatShareBtn, { top: insets.top + Spacing[2] }]}
        onPress={() => Share.share({
          message: `${event.title}\n\nhttps://eventosagropy.com/eventos/${event.slug}`,
          url: `https://eventosagropy.com/eventos/${event.slug}`,
        })}
        hitSlop={12}
      >
        <Ionicons name="share-outline" size={22} color="#FFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}>
        {/* Imagen hero */}
        <View>
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.hero} resizeMode="cover" />
          ) : (
            <View style={[styles.hero, styles.heroPlaceholder, { backgroundColor: C.secondary }]}>
              <Ionicons name="calendar-outline" size={56} color={Colors.lime} />
            </View>
          )}
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{event.category}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground }}>
            {event.title}
          </Text>

          {/* Meta */}
          <View style={[styles.metaCard, { backgroundColor: C.surface }]}>
            <MetaRow icon="calendar-outline" text={formatFullDate(event.date)} C={C} />
            {event.endDate && event.endDate !== event.date && (
              <MetaRow icon="calendar-clear-outline" text={`Hasta: ${formatFullDate(event.endDate)}`} C={C} />
            )}
            {event.time && <MetaRow icon="time-outline" text={event.time} C={C} />}
            <MetaRow
              icon="location-outline"
              text={[event.location, event.city, event.department].filter(Boolean).join(' · ')}
              C={C}
            />
          </View>

          {/* Tabs — solo aparecen si hay cobertura extra cargada para este evento */}
          {showTabs && (
            <View style={[styles.tabBar, { backgroundColor: C.surface, borderColor: C.border }]}>
              {tabs.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tabItem, tab === t.key && { backgroundColor: Colors.lime }]}
                  onPress={() => setTab(t.key)}
                >
                  <Text
                    variant="body"
                    weight="semibold"
                    style={{ color: tab === t.key ? '#0A0A13' : C.muted }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {tab === 'info' && (
            <>
              {/* Descripción */}
              {(event.longDescription ?? event.description) ? (
                <Text variant="body" style={{ color: C.foreground, lineHeight: 24 }}>
                  {event.longDescription ?? event.description}
                </Text>
              ) : null}

              {/* Recordar evento — solo si faltan 2+ días */}
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
                    {reminding ? 'Programando…' : 'Recordar este evento'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Links importantes */}
              {event.importantLinks && event.importantLinks.length > 0 && (
                <View style={{ gap: Spacing[2] }}>
                  <Text variant="body" weight="semibold" style={{ color: C.foreground }}>Links de interés</Text>
                  {event.importantLinks.map((link, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.linkRow, { borderColor: C.border }]}
                      onPress={() => Linking.openURL(link.url)}
                    >
                      <Ionicons name="link-outline" size={16} color={Colors.lime} />
                      <Text variant="body" style={{ color: Colors.lime, flex: 1 }} numberOfLines={1}>{link.label}</Text>
                      <Ionicons name="open-outline" size={14} color={C.muted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Contacto */}
              {(event.contactEmail || event.contactPhone) && (
                <View style={[styles.contactCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <Text variant="caption" weight="semibold" style={{ color: C.muted }}>CONTACTO</Text>
                  {event.contactEmail && (
                    <TouchableOpacity onPress={() => Linking.openURL(`mailto:${event.contactEmail}`)}>
                      <Text variant="body" style={{ color: Colors.lime }}>{event.contactEmail}</Text>
                    </TouchableOpacity>
                  )}
                  {event.contactPhone && (
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${event.contactPhone}`)}>
                      <Text variant="body" style={{ color: C.foreground }}>{event.contactPhone}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Ver en mapa */}
              {event.mapsUrl && (
                <TouchableOpacity
                  style={[styles.mapBtn, { borderColor: C.border }]}
                  onPress={() => Linking.openURL(event.mapsUrl!)}
                >
                  <Ionicons name="map-outline" size={18} color={C.foreground} />
                  <Text variant="body" weight="medium" style={{ color: C.foreground }}>Ver en el mapa</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {tab === 'programa' && (
            <View style={{ gap: Spacing[3] }}>
              {schedule.map((item, i) => {
                const showDayLabel = item.dayLabel && (i === 0 || schedule[i - 1].dayLabel !== item.dayLabel)
                return (
                  <View key={item.id}>
                    {showDayLabel && (
                      <Text variant="label" weight="semibold" style={{ color: Colors.lime, marginBottom: Spacing[1.5] }}>
                        {item.dayLabel!.toUpperCase()}
                      </Text>
                    )}
                    <View style={[styles.scheduleCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                      {item.time && (
                        <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>{item.time}</Text>
                      )}
                      <Text variant="body" weight="semibold" style={{ color: C.foreground }}>{item.title}</Text>
                      {item.speaker && (
                        <Text variant="caption" style={{ color: C.muted }}>{item.speaker}</Text>
                      )}
                      {item.description && (
                        <Text variant="body" style={{ color: C.muted, lineHeight: 20 }}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {tab === 'noticias' && (
            <View style={{ gap: Spacing[3] }}>
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

function MetaRow({ icon, text, C }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string; C: any }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={16} color={Colors.lime} />
      <Text variant="body" style={{ color: C.foreground, flex: 1 }}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing[3] },
  backBtn: {
    position: 'absolute',
    left: Spacing[5],
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  floatShareBtn: {
    position: 'absolute',
    right: Spacing[5],
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  hero: { width: '100%', height: 260 },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  catBadge: {
    position: 'absolute',
    bottom: Spacing[3],
    left: Spacing[5],
    backgroundColor: Colors.lime,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[0.5],
  },
  catText: { fontSize: 11, fontWeight: '700', color: '#0A0A13', textTransform: 'uppercase' },
  body: { padding: Spacing[5], gap: Spacing[6] },
  metaCard: { gap: Spacing[3], padding: Spacing[4], borderRadius: Radius.xl },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.lime,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  contactCard: {
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing[2],
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[3.5],
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[1],
    gap: Spacing[1],
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.lg,
  },
  scheduleCard: {
    gap: Spacing[1],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
})
