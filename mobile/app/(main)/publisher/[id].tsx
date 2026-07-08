import { useState, useEffect } from 'react'
import { View, FlatList, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/home/EventCard'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { mockPublishers, mockNews } from '@/lib/mock-data'
import {
  fetchPostsByOrganization,
  fetchOrganizationById,
  fetchEventsByOrganizerSlug,
  fetchSubscriptionNotify,
  upsertSubscriptionNotify,
} from '@/lib/supabase-repositories'
import type { AgroEvent, NewsArticle, Organization } from '@/lib/types'

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'Hace menos de 1h'
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

const categoryColors: Record<string, string> = {
  media: Colors.lime,
  institucion: Colors.category.institucional,
  gremio: Colors.category.ganaderia,
}

export default function PublisherScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const C = useColors()
  const { user, updateUser } = useApp()

  const [publisher, setPublisher] = useState<Organization | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const isFollowed = user?.organizationSubscriptions?.includes(id ?? '') ?? false
  const [notifOn, setNotifOn] = useState(false)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [organizedEvents, setOrganizedEvents] = useState<AgroEvent[]>([])

  useEffect(() => {
    if (!id) return
    let mounted = true

    // Limpiar estado de la organizacion anterior para no mezclar datos al navegar entre publishers
    setPublisher(mockPublishers.find((p) => p.id === id))
    setArticles(mockNews.filter((n) => n.publisherId === id))
    setOrganizedEvents([])
    setNotifOn(false)
    setLoading(true)

    fetchOrganizationById(id)
      .then((org) => { if (mounted && org) setPublisher(org) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })

    fetchPostsByOrganization(id)
      .then((remote) => { if (mounted) setArticles(remote as NewsArticle[]) })
      .catch(() => {})
    return () => { mounted = false }
  }, [id])

  // Eventos organizados por este medio (si tiene el mapeo a eventosagropy.com cargado)
  useEffect(() => {
    if (!publisher?.eventsOrganizerSlug) { setOrganizedEvents([]); return }
    fetchEventsByOrganizerSlug(publisher.eventsOrganizerSlug)
      .then(setOrganizedEvents)
      .catch(() => setOrganizedEvents([]))
  }, [publisher?.eventsOrganizerSlug])

  // Estado real de la campanita, guardado en user_subscriptions
  useEffect(() => {
    if (!user?.id || !id) return
    fetchSubscriptionNotify(user.id, id)
      .then((notify) => setNotifOn(notify ?? false))
      .catch(() => {})
  }, [user?.id, id])

  async function toggleFollow() {
    if (!user || !id) return
    const current = user.organizationSubscriptions ?? []
    const updated = isFollowed ? current.filter((x) => x !== id) : [...current, id]
    await updateUser({ organizationSubscriptions: updated, mediaPreferences: updated })
  }

  async function toggleNotif() {
    if (!user?.id || !id) return
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Activá las notificaciones en los ajustes del dispositivo.')
      return
    }
    const next = !notifOn
    setNotifOn(next)
    await upsertSubscriptionNotify(user.id, id, next)
    // Tocar la campanita sin estar siguiendo la organización también la sigue
    if (!isFollowed) await toggleFollow()
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Text variant="body" style={{ color: C.muted }}>Cargando...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!publisher) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={C.muted} />
          <Text variant="body" style={{ color: C.muted, marginTop: Spacing[3] }}>Organización no encontrada.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text variant="body" style={{ color: Colors.lime }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const currentPublisher = publisher!
  const catColor = categoryColors[currentPublisher.category] ?? Colors.lime

  function PublisherHeader() {
    return (
      <View style={styles.headerSection}>
        {/* Botón back */}
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </TouchableOpacity>

        {/* Info del medio */}
        <View style={styles.publisherCard}>
          {currentPublisher.logoUrl ? (
            <Image source={{ uri: currentPublisher.logoUrl }} style={styles.publisherAvatarImage} />
          ) : (
            <View style={[styles.publisherAvatar, { backgroundColor: `${catColor}18` }]}>
              <Ionicons name="radio-outline" size={32} color={catColor} />
            </View>
          )}

          <View style={styles.publisherMeta}>
            <View style={styles.nameRow}>
              <Text variant="subtitle" weight="bold" family="poppins">{currentPublisher.name}</Text>
              {currentPublisher.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.lime} />
                  <Text variant="label" style={{ color: Colors.lime }}>Verificado</Text>
                </View>
              )}
            </View>

            <Text variant="caption" color={C.muted} style={{ textTransform: 'capitalize' }}>
              {currentPublisher.category === 'media' ? 'Medio de comunicación' : currentPublisher.category === 'institucion' ? 'Institución' : 'Gremio'}
            </Text>

            <Text variant="body" color={C.muted} style={styles.publisherDesc}>
              {currentPublisher.description}
            </Text>
          </View>

          {/* Acciones: Seguir + Notificaciones */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={toggleFollow}
              style={[styles.followBtn, isFollowed && styles.followBtnActive]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFollowed ? 'checkmark-circle' : 'add-circle-outline'}
                size={18}
                color={isFollowed ? '#0A0A13' : Colors.lime}
              />
              <Text
                variant="caption"
                weight="semibold"
                style={{ color: isFollowed ? '#0A0A13' : Colors.lime }}
              >
                {isFollowed ? 'Siguiendo' : 'Seguir'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleNotif}
              style={[styles.notifBtn, { borderColor: notifOn ? Colors.lime : C.border, backgroundColor: notifOn ? `${Colors.lime}18` : 'transparent' }]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={notifOn ? 'notifications' : 'notifications-outline'}
                size={18}
                color={notifOn ? Colors.lime : C.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {organizedEvents.length > 0 && (
          <View style={{ gap: Spacing[3] }}>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              Eventos organizados
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsRow}>
              {organizedEvents.map((event) => (
                <EventCard key={event.id} event={event} onPress={() => router.push(`/event/${event.slug}`)} />
              ))}
            </ScrollView>
          </View>
        )}

        {articles.length > 0 && (
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>
            Noticias de {currentPublisher.name}
          </Text>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top', 'bottom']}>
      <FlatList
        data={articles}
        keyExtractor={(n) => n.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<PublisherHeader />}
        renderItem={({ item }) => <ArticleRow article={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={40} color={C.muted} />
            <Text variant="body" color={C.muted} style={{ marginTop: Spacing[3], textAlign: 'center' }}>
              Sin noticias disponibles todavía.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

function ArticleRow({ article }: { article: NewsArticle }) {
  const C = useColors()
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/article/${article.id}`)}
    >
      <Card style={styles.articleRow}>
        <View style={styles.articleLeft}>
          <Badge variant={article.category}>{categoryLabel(article.category)}</Badge>
          <Text variant="body" weight="medium" numberOfLines={2} style={styles.articleTitle}>
            {article.title}
          </Text>
          <Text variant="caption" color={C.muted}>{timeAgo(article.publishedAt)} · {article.readTime} min</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.muted} style={{ marginTop: Spacing[1] }} />
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing[5], gap: Spacing[3], paddingBottom: Spacing[8] },
  headerSection: { gap: Spacing[4], marginBottom: Spacing[2] },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publisherCard: { gap: Spacing[3] },
  publisherAvatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publisherAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
  },
  publisherMeta: { gap: Spacing[1.5] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], flexWrap: 'wrap' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${Colors.lime}15`, paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: Radius.sm },
  publisherDesc: { lineHeight: 21, marginTop: Spacing[1] },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.base,
    borderWidth: 1.5,
    borderColor: Colors.lime,
    backgroundColor: `${Colors.lime}10`,
  },
  followBtnActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {},
  eventsRow: { gap: Spacing[3] },
  articleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2], padding: Spacing[4] },
  articleLeft: { flex: 1, gap: Spacing[1.5] },
  articleTitle: { lineHeight: 21 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing[4] },
  backLink: { padding: Spacing[2] },
  empty: { alignItems: 'center', paddingTop: Spacing[8] },
})
