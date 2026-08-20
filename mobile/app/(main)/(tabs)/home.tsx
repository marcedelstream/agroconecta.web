import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { AdBanner } from '@/components/ui/AdBanner'
import { HeroCarouselSkeleton } from '@/components/ui/Skeleton'
import { HomeTopBar } from '@/components/home/HomeTopBar'
import { HomeGreetingCard } from '@/components/home/HomeGreetingCard'
import { PriceBoard } from '@/components/home/PriceBoard'
import { QuickServicesGrid } from '@/components/home/QuickServicesGrid'
import { LiveCard } from '@/components/home/LiveCard'
import { NewsForYou } from '@/components/home/NewsForYou'
import { EventsSection } from '@/components/home/EventsSection'
import { FeaturedEventsSection } from '@/components/home/FeaturedEventsSection'
import { SectionOrderSheet } from '@/components/home/SectionOrderSheet'
import { DrawerMenu } from '@/components/navigation/DrawerMenu'
import { buildSegment, isNewsContent } from '@/lib/feed-utils'
import { mockNews } from '@/lib/mock-data'
import { fetchPublishedPosts, fetchLiveVideos } from '@/lib/supabase-repositories'
import { useApp } from '@/lib/app-context'
import { HOME_SECTIONS, normalizeSectionOrder, type HomeSectionKey } from '@/lib/home-sections'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import type { Post } from '@/lib/types'

const R = Colors.redesign

export default function HomeScreen() {
  const { user, updateUser } = useApp()
  const [posts, setPosts] = useState<Post[]>([])
  const [liveVideo, setLiveVideo] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adRefreshKey, setAdRefreshKey] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showOrderSheet, setShowOrderSheet] = useState(false)

  const loadPosts = useCallback(async () => {
    try {
      const remote = await fetchPublishedPosts()
      const news = remote.filter(isNewsContent)
      if (news.length > 0) setPosts(news)
    } catch {
      setPosts(mockNews)
    }
  }, [])

  const loadLive = useCallback(async () => {
    try {
      const videos = await fetchLiveVideos()
      setLiveVideo(videos[0] ?? null)
    } catch {
      setLiveVideo(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    Promise.all([loadPosts(), loadLive()]).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [loadPosts, loadLive])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setAdRefreshKey((k) => k + 1)
    await Promise.all([loadPosts(), loadLive()])
    setRefreshing(false)
  }, [loadPosts, loadLive])

  const filtered = useMemo(() => {
    const highlighted = posts.find((p) => p.isHighlighted)
    if (highlighted) return [highlighted, ...posts.filter((p) => p.id !== highlighted.id)]
    return posts
  }, [posts])

  const segment = user ? buildSegment(user) : undefined

  const goToArticle = useCallback((id: string) => {
    router.push(`/article/${id}`)
  }, [])

  const widgetContent: Record<HomeSectionKey, React.ReactNode> = {
    featured: <FeaturedEventsSection />,
    market: <PriceBoard />,
    services: <QuickServicesGrid />,
    live: liveVideo ? <LiveCard video={liveVideo} /> : null,
    news: filtered.length > 0 ? <NewsForYou hero={filtered[0]} rows={filtered.slice(1, 4)} onPress={goToArticle} /> : null,
    agenda: <EventsSection />,
  }

  const slots = user
    ? normalizeSectionOrder(user.sectionOrder)
        .map((key) => ({ key, node: widgetContent[key] }))
        .filter((slot) => slot.node !== null)
    : []

  if (!user) return null

  return (
    <View style={[styles.root, { backgroundColor: R.background }]}>
      {/* Cabecera estática — logo/menú y la tarjeta de saludo/buscador no se scrollean con
          el resto. Evita toda la complejidad (y los bugs) de un header oscuro que se mezcla
          con el contenido claro durante el pull-to-refresh en iOS. */}
      <SafeAreaView edges={['top']} style={[styles.headerWrap, { backgroundColor: R.header.bg }]}>
        <HomeTopBar onMenuPress={() => setMenuOpen(true)} />
        <HomeGreetingCard
          user={user}
          onAdjustInterestsPress={() => setShowOrderSheet(true)}
        />
      </SafeAreaView>

      <ScrollView
        style={styles.scroller}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />}
      >
        {loading ? (
          <View style={[styles.bandFirst, styles.bandPadded]}>
            <HeroCarouselSkeleton />
          </View>
        ) : (
          <>
            {slots.map((slot, i) => (
              <Fragment key={slot.key}>
                <View style={[i === 0 ? styles.bandFirst : styles.band, styles.bandPadded]}>
                  {slot.node}
                </View>
                {i === 0 && (
                  <View style={[styles.band, styles.bandPadded]}>
                    <AdBanner segment={segment} placement="home" refreshKey={adRefreshKey} />
                  </View>
                )}
              </Fragment>
            ))}
            <View style={[styles.band, styles.bandPadded]}>
              <AdBanner segment={segment} placement="home" refreshKey={adRefreshKey} />
            </View>
          </>
        )}
      </ScrollView>

      {menuOpen && <DrawerMenu onClose={() => setMenuOpen(false)} />}

      {showOrderSheet && (
        <SectionOrderSheet
          sections={HOME_SECTIONS}
          normalize={normalizeSectionOrder}
          order={user.sectionOrder}
          onChange={(order) => updateUser({ sectionOrder: order })}
          onClose={() => setShowOrderSheet(false)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // El redondeo va acá afuera (no en HomeGreetingCard) — así el corte se nota contra el
  // fondo claro del scroll de abajo. Puesto adentro, oscuro sobre oscuro, no se veía nada.
  headerWrap: { borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden' },
  scroller: { flex: 1, backgroundColor: R.background },
  content: { paddingTop: 20, paddingBottom: 26 },
  bandFirst: { marginTop: 0 },
  band: { marginTop: 24 },
  bandPadded: { paddingHorizontal: Spacing[5] },
})
