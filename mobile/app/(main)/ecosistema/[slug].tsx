import { useEffect, useMemo, useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ListingCard } from '@/components/ecosystem/ListingCard'
import { AdBanner } from '@/components/ui/AdBanner'
import { Colors } from '@/constants/colors'
import { ECOSYSTEM_PLATFORMS } from '@/lib/ecosystem-data'
import { mockEcosystemListings } from '@/lib/mock-data'
import { fetchEcosystemListings } from '@/lib/supabase-repositories'
import type { EcosystemListing } from '@/lib/types'

const R = Colors.redesign
const AD_EVERY = 4

export default function EcosistemaDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const platform = ECOSYSTEM_PLATFORMS.find((p) => p.id === slug)
  const [listings, setListings] = useState<EcosystemListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (platform?.route) {
      router.replace(platform.route as any)
    }
  }, [platform?.route])

  useEffect(() => {
    if (!platform?.listingKind) return
    const kind = platform.listingKind
    fetchEcosystemListings(kind)
      .then((data) => setListings(data.length > 0 ? data : mockEcosystemListings.filter((l) => l.kind === kind)))
      .catch(() => setListings(mockEcosystemListings.filter((l) => l.kind === kind)))
      .finally(() => setLoading(false))
  }, [platform?.listingKind])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return listings
    return listings.filter(
      (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
    )
  }, [listings, search])

  if (!platform || platform.route) {
    return (
      <View style={[styles.center, { backgroundColor: R.background }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: R.background }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>{platform.name}</Text>
          <View style={{ width: 20 }} />
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.intro}>
            <Text family="noto-sans" weight="extrabold" size={21} lineHeight={27} color={R.foreground}>
              {platform.name}
            </Text>
            <Text family="noto-sans" size={14} lineHeight={21} color={R.mutedForeground} style={styles.introDesc}>
              {platform.description}
            </Text>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={17} color={R.mutedForeground} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Buscar en ${platform.name.toLowerCase()}`}
                placeholderTextColor={R.mutedForeground}
                style={styles.searchInput}
                autoCorrect={false}
              />
            </View>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name={platform.icon} size={40} color={R.mutedForeground} />
              <Text family="noto-sans" size={14} color={R.mutedForeground} style={styles.emptyText}>
                {search.trim() ? `Sin resultados para "${search}".` : `Todavía no hay publicaciones en ${platform.name}.`}
              </Text>
            </View>
          ) : (
            filtered.map((listing, i) => (
              <View key={listing.id} style={styles.itemGap}>
                <ListingCard
                  listing={listing}
                  onPress={() => router.push(`/(main)/listing/${listing.id}` as any)}
                />
                {(i + 1) % AD_EVERY === 0 && <AdBanner placement="home" style={styles.adBanner} />}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  content: { padding: 20, gap: 10 },
  intro: { marginBottom: 10 },
  introDesc: { marginTop: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.secondary,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  searchInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 13.5, color: R.foreground, padding: 0 },
  itemGap: { gap: 10 },
  adBanner: {},
  emptyText: { marginTop: 12, textAlign: 'center' },
})
