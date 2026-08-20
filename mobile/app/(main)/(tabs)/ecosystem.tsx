import { useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { HeaderAvatar } from '@/components/navigation/HeaderAvatar'
import { PlatformList } from '@/components/ecosystem/PlatformList'
import { ListingCard } from '@/components/ecosystem/ListingCard'
import { BookCard } from '@/components/library/BookCard'
import { SectionOrderSheet } from '@/components/home/SectionOrderSheet'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { mockEcosystemListings } from '@/lib/mock-data'
import { fetchPublishedPosts, fetchEcosystemListings, fetchLibraryItems } from '@/lib/supabase-repositories'
import { ECOSYSTEM_SECTIONS, normalizeEcosystemSectionOrder, type EcosystemSectionKey } from '@/lib/ecosystem-sections'
import type { EcosystemListing, LibraryItem, Post } from '@/lib/types'

const R = Colors.redesign
const PREVIEW_COUNT = 3
const CATEGORY_COUNT = 15

type EcoCategory = 'todo' | 'videos' | 'empleo' | 'clasificado' | 'curso' | 'biblioteca'

const CHIPS: { key: EcoCategory; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'videos', label: 'Videos' },
  { key: 'empleo', label: 'Empleos' },
  { key: 'clasificado', label: 'Clasificados' },
  { key: 'curso', label: 'Cursos' },
  { key: 'biblioteca', label: 'Biblioteca' },
]

function videoDuration(post: Post) {
  if (post.contentType === 'auction') return post.auctionStatus === 'live' ? 'En vivo' : 'Próximo'
  return `${post.readTime} min`
}

function matches(q: string, ...values: (string | undefined)[]) {
  if (!q) return true
  const needle = q.toLowerCase()
  return values.some((v) => v?.toLowerCase().includes(needle))
}

export default function EcosystemScreen() {
  const { user, updateUser } = useApp()
  const [videos, setVideos] = useState<Post[]>([])
  const [listings, setListings] = useState<EcosystemListing[]>([])
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<EcoCategory>('todo')
  const [showOrderSheet, setShowOrderSheet] = useState(false)

  useEffect(() => {
    fetchPublishedPosts()
      .then((posts) => setVideos(posts.filter((p) => p.contentType === 'video' || p.contentType === 'auction')))
      .catch(() => setVideos([]))
    fetchEcosystemListings()
      .then((data) => setListings(data.length > 0 ? data : mockEcosystemListings))
      .catch(() => setListings(mockEcosystemListings))
    fetchLibraryItems()
      .then(setLibraryItems)
      .catch(() => setLibraryItems([]))
  }, [])

  const q = search.trim()
  const isSearching = q.length > 0
  const cap = isSearching ? Infinity : activeCategory === 'todo' ? PREVIEW_COUNT : CATEGORY_COUNT

  const showVideos = activeCategory === 'todo' || activeCategory === 'videos'
  const showEmpleos = activeCategory === 'todo' || activeCategory === 'empleo'
  const showClasificados = activeCategory === 'todo' || activeCategory === 'clasificado'
  const showCursos = activeCategory === 'todo' || activeCategory === 'curso'
  const showBiblioteca = activeCategory === 'todo' || activeCategory === 'biblioteca'

  const filteredVideos = useMemo(
    () => (showVideos ? videos.filter((v) => matches(q, v.title, v.source)).slice(0, cap) : []),
    [videos, q, cap, showVideos]
  )
  const empleos = useMemo(
    () => (showEmpleos ? listings.filter((l) => l.kind === 'empleo' && matches(q, l.title, l.description, l.location)).slice(0, cap) : []),
    [listings, q, cap, showEmpleos]
  )
  const clasificados = useMemo(
    () => (showClasificados ? listings.filter((l) => l.kind === 'clasificado' && matches(q, l.title, l.description, l.location)).slice(0, cap) : []),
    [listings, q, cap, showClasificados]
  )
  const cursos = useMemo(
    () => (showCursos ? listings.filter((l) => l.kind === 'curso' && matches(q, l.title, l.description, l.location)).slice(0, cap) : []),
    [listings, q, cap, showCursos]
  )
  const library = useMemo(
    () => (showBiblioteca ? libraryItems.filter((l) => matches(q, l.title, l.author, l.description)).slice(0, cap) : []),
    [libraryItems, q, cap, showBiblioteca]
  )

  const noResults =
    isSearching && filteredVideos.length === 0 && empleos.length === 0 && clasificados.length === 0 && cursos.length === 0 && library.length === 0

  const sectionContent: Record<EcosystemSectionKey, React.ReactNode> = {
    videos: filteredVideos.length > 0 ? (
      <View key="videos" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>Videos</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/videos' as any)} hitSlop={8}>
            <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
              Ver todo
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videosRow}>
          {filteredVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/(main)/video/${video.id}` as any)}
            >
              <View style={styles.videoThumbWrap}>
                <Image source={{ uri: video.imageUrl }} style={styles.videoThumb} resizeMode="cover" />
                <View style={styles.videoOverlay} />
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={13} color={R.foreground} />
                </View>
                <View style={styles.durationPill}>
                  <Text family="noto-sans" weight="semibold" size={10.5} color="#FFFFFF">{videoDuration(video)}</Text>
                </View>
              </View>
              <View style={styles.videoBody}>
                <Text family="noto-sans" weight="semibold" size={13.5} lineHeight={18} color={R.foreground} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text family="noto-sans" size={11.5} color={R.mutedForeground} style={styles.videoChannel}>
                  {video.source}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ) : null,

    empleos: empleos.length > 0 ? (
      <View key="empleos" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>Empleos</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/ecosistema/bolsa-trabajo' as any)} hitSlop={8}>
            <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
              Ver todo
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listingsRow}>
          {empleos.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              style={styles.listingCardFixed}
              onPress={() => router.push(`/(main)/listing/${item.id}` as any)}
            />
          ))}
        </ScrollView>
      </View>
    ) : null,

    clasificados: clasificados.length > 0 ? (
      <View key="clasificados" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>Clasificados</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/ecosistema/clasificados' as any)} hitSlop={8}>
            <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
              Ver todo
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listingsRow}>
          {clasificados.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              style={styles.listingCardFixed}
              onPress={() => router.push(`/(main)/listing/${item.id}` as any)}
            />
          ))}
        </ScrollView>
      </View>
    ) : null,

    cursos: cursos.length > 0 ? (
      <View key="cursos" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>Cursos</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/ecosistema/cursos' as any)} hitSlop={8}>
            <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
              Ver todo
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listingsRow}>
          {cursos.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              style={styles.listingCardFixed}
              onPress={() => router.push(`/(main)/listing/${item.id}` as any)}
            />
          ))}
        </ScrollView>
      </View>
    ) : null,

    biblioteca: library.length > 0 ? (
      <View key="biblioteca" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>Biblioteca del agro</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/library' as any)} hitSlop={8}>
            <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
              Ver todo
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.libraryRow}>
          {library.map((item) => (
            <BookCard key={item.id} item={item} onPress={() => router.push(`/(main)/book/${item.id}` as any)} />
          ))}
        </ScrollView>
      </View>
    ) : null,
  }

  const orderedSections = normalizeEcosystemSectionOrder(user?.ecosystemSectionOrder)
    .map((key) => sectionContent[key])
    .filter((node) => node !== null)

  if (!user) return null

  return (
    <View style={[styles.root, { backgroundColor: R.background }]}>
      <SafeAreaView edges={['top']} style={[styles.headerWrap, { backgroundColor: R.header.bg }]}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Text family="noto-sans" weight="bold" size={20} color="#FFFFFF">Ecosistema</Text>
            <HeaderAvatar name={user.name} />
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={17} color={R.header.placeholder} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar en el ecosistema"
              placeholderTextColor={R.header.placeholder}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroller} contentContainerStyle={styles.chipsRow}>
            {CHIPS.map((chip) => {
              const active = chip.key === activeCategory
              return (
                <TouchableOpacity
                  key={chip.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveCategory(chip.key)}
                  activeOpacity={0.8}
                >
                  <Text family="noto-sans" weight="semibold" size={12} color={active ? '#0A0A13' : '#C9C9D2'}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeCategory === 'todo' && !isSearching && (
          <View style={styles.introSection}>
            <View style={styles.introHeadRow}>
              <Text family="noto-sans" weight="medium" size={10} color={R.mutedForeground2} style={styles.introEyebrow}>
                TODO LO QUE TENEMOS PARA VOS
              </Text>
              <TouchableOpacity onPress={() => setShowOrderSheet(true)} style={styles.adjustChip} activeOpacity={0.8}>
                <Text family="noto-sans" weight="semibold" size={11} color={R.mutedForeground}>Ajustar interés</Text>
                <Ionicons name="swap-vertical-outline" size={12} color={R.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text family="noto-sans" weight="extrabold" size={20} lineHeight={26} color={R.foreground}>
              El ecosistema del agro,{'\n'}en una sola app
            </Text>
            <View style={styles.platformsWrap}>
              <PlatformList />
            </View>
          </View>
        )}

        {noResults && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={R.mutedForeground} />
            <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyText}>
              Sin resultados para "{q}".
            </Text>
          </View>
        )}

        {orderedSections}

      </ScrollView>

      {showOrderSheet && (
        <SectionOrderSheet
          title="Ajustar interés"
          sections={ECOSYSTEM_SECTIONS}
          normalize={normalizeEcosystemSectionOrder}
          order={user.ecosystemSectionOrder}
          onChange={(order) => updateUser({ ecosystemSectionOrder: order })}
          onClose={() => setShowOrderSheet(false)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden' },
  header: {
    backgroundColor: R.header.bg,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.header.chip,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 13.5, color: '#FFFFFF', padding: 0 },
  chipsScroller: { marginHorizontal: -20 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 14, paddingHorizontal: 20, paddingRight: 28 },
  chip: { borderWidth: 1, borderColor: R.header.chipBorder, borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 7 },
  chipActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  content: { paddingTop: 20, paddingBottom: 26 },
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyText: { marginTop: 12, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 12 },
  underline: { textDecorationLine: 'underline' },
  listingsRow: { flexDirection: 'row', gap: 10, paddingLeft: 20, paddingRight: 8 },
  listingCardFixed: { width: 220, height: 168 },
  // Mismo patrón "peek" que la Agenda del sector (EventsSection): padding chico a la
  // derecha en vez de simétrico, así la última tarjeta queda visible entera al llegar al
  // final del scroll en vez de quedar recortada contra el borde de la pantalla.
  videosRow: { flexDirection: 'row', gap: 10, paddingLeft: 20, paddingRight: 8 },
  // Tarjeta unificada (fondo + radio + overflow hidden en el contenedor, como en Agenda)
  // en vez de solo redondear la miniatura — así imagen y texto quedan en un mismo molde.
  videoCard: { width: 214, backgroundColor: R.surface, borderRadius: 16, overflow: 'hidden' },
  videoThumbWrap: { height: 120, position: 'relative' },
  videoThumb: { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  playBtn: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  videoBody: { padding: 12, gap: 5 },
  videoChannel: {},
  libraryRow: { flexDirection: 'row', gap: 14, paddingLeft: 20, paddingRight: 8 },
  introSection: { paddingHorizontal: 20, marginTop: 4, marginBottom: 28 },
  introHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  introEyebrow: { letterSpacing: 0.7 },
  adjustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: R.border,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  platformsWrap: { marginTop: 14 },
})
