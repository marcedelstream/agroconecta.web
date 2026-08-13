import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { AdBanner } from '@/components/ui/AdBanner'
import { HeroCarouselSkeleton } from '@/components/ui/Skeleton'
import { HomeTopBar } from '@/components/home/HomeTopBar'
import { HomeGreetingCard } from '@/components/home/HomeGreetingCard'
import { PriceBoard } from '@/components/home/PriceBoard'
import { QuickServicesGrid } from '@/components/home/QuickServicesGrid'
import { LiveCard } from '@/components/home/LiveCard'
import { NewsForYou } from '@/components/home/NewsForYou'
import { EventsSection } from '@/components/home/EventsSection'
import { SectionOrderSheet } from '@/components/home/SectionOrderSheet'
import { DrawerMenu } from '@/components/navigation/DrawerMenu'
import { buildSegment, isNewsContent } from '@/lib/feed-utils'
import { mockNews } from '@/lib/mock-data'
import { fetchPublishedPosts, fetchLiveVideos } from '@/lib/supabase-repositories'
import { useApp } from '@/lib/app-context'
import { normalizeSectionOrder, type HomeSectionKey } from '@/lib/home-sections'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import type { Post } from '@/lib/types'

const R = Colors.redesign

export default function HomeScreen() {
  const { user, updateUser } = useApp()
  const [search, setSearch] = useState('')
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
    let list = [...posts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))
    }
    const highlighted = list.find((p) => p.isHighlighted)
    if (highlighted) return [highlighted, ...list.filter((p) => p.id !== highlighted.id)]
    return list
  }, [posts, search])

  const segment = user ? buildSegment(user) : undefined

  const goToArticle = useCallback((id: string) => {
    router.push(`/article/${id}`)
  }, [])

  const widgetContent: Record<HomeSectionKey, React.ReactNode> = {
    market: <PriceBoard />,
    services: <QuickServicesGrid />,
    live: liveVideo ? <LiveCard video={liveVideo} /> : null,
    news: filtered.length > 0 ? <NewsForYou hero={filtered[0]} rows={filtered.slice(1, 4)} onPress={goToArticle} /> : null,
    agenda: <EventsSection search={search} />,
  }

  const slots = user
    ? normalizeSectionOrder(user.sectionOrder)
        .map((key) => ({ key, node: widgetContent[key] }))
        .filter((slot) => slot.node !== null)
    : []

  if (!user) return null

  return (
    <View style={[styles.root, { backgroundColor: R.background }]}>
      {/* Solo tapa el hueco del rebote/pull-to-refresh arriba de todo — el ScrollView
          vuelve a ser transparente así el rebote de ABAJO no se pinta oscuro también. */}
      <View style={[styles.topBounceBackdrop, { backgroundColor: R.header.bg }]} pointerEvents="none" />

      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <HomeTopBar onMenuPress={() => setMenuOpen(true)} />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />}
      >
        <HomeGreetingCard
          user={user}
          search={search}
          onSearchChange={setSearch}
          onAdjustInterestsPress={() => setShowOrderSheet(true)}
        />

        {loading ? (
          <View style={[styles.bandFirst, styles.bandPadded]}>
            <HeroCarouselSkeleton />
          </View>
        ) : (
          <>
            {search.trim() !== '' && filtered.length === 0 && (
              <View style={[styles.bandFirst, styles.bandPadded, styles.empty]}>
                <Text family="noto-sans" size={14} color={R.mutedForeground} style={{ textAlign: 'center' }}>
                  Sin resultados para "{search}".
                </Text>
              </View>
            )}

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
          </>
        )}
      </ScrollView>

      {menuOpen && <DrawerMenu onClose={() => setMenuOpen(false)} />}

      {showOrderSheet && (
        <SectionOrderSheet
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
  // Detrás del ScrollView, solo cubre la franja de arriba: si el usuario tira del
  // rebote/pull-to-refresh hacia abajo, lo que se asoma es esto (oscuro, continuo con
  // la cabecera) en vez del fondo claro de la página. No cubre la parte de abajo, así
  // el rebote al llegar al final del scroll muestra el fondo claro normal.
  topBounceBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  // Fondo claro explícito acá (no alcanza con `root`): así cualquier hueco entre
  // widgets tapa por completo el backdrop oscuro de arriba en vez de dejarlo asomar.
  content: { backgroundColor: R.background, paddingBottom: 26 },
  bandFirst: { marginTop: 20 },
  band: { marginTop: 24 },
  bandPadded: { paddingHorizontal: Spacing[5] },
  empty: { alignItems: 'center', paddingVertical: Spacing[6] },
})
