import { useEffect, useState } from 'react'
import { View, ScrollView, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { mockEcosystemListings } from '@/lib/mock-data'
import { fetchEcosystemListingById, fetchEcosystemListings } from '@/lib/supabase-repositories'
import type { EcosystemListing } from '@/lib/types'

const R = Colors.redesign
const SAVED_LISTINGS_KEY = '@agroconecta:saved_listings'

function timeAgo(date: Date): string {
  const h = Math.floor((Date.now() - date.getTime()) / 3600000)
  if (h < 1) return 'Hace menos de 1h'
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [listing, setListing] = useState<EcosystemListing | null | undefined>(undefined)
  const [others, setOthers] = useState<EcosystemListing[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchEcosystemListingById(id)
      .then((data) => setListing(data ?? mockEcosystemListings.find((l) => l.id === id) ?? null))
      .catch(() => setListing(mockEcosystemListings.find((l) => l.id === id) ?? null))
  }, [id])

  useEffect(() => {
    if (!listing) return
    fetchEcosystemListings()
      .then((data) => setOthers(data.filter((l) => l.id !== listing.id && l.kind !== listing.kind).slice(0, 2)))
      .catch(() => setOthers(mockEcosystemListings.filter((l) => l.id !== listing.id && l.kind !== listing.kind).slice(0, 2)))
  }, [listing])

  useEffect(() => {
    if (!id) return
    AsyncStorage.getItem(SAVED_LISTINGS_KEY)
      .then((raw) => {
        const list: string[] = raw ? JSON.parse(raw) : []
        setSaved(list.includes(id))
      })
      .catch(() => {})
  }, [id])

  async function toggleSaved() {
    if (!id) return
    const raw = await AsyncStorage.getItem(SAVED_LISTINGS_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    const updated = saved ? list.filter((x) => x !== id) : [...list, id]
    await AsyncStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(updated))
    setSaved(!saved)
  }

  function handleContact() {
    if (listing?.contactUrl) Linking.openURL(listing.contactUrl).catch(() => {})
  }

  if (listing === undefined) return <View style={[styles.root, { backgroundColor: R.surface }]} />

  if (!listing) {
    return (
      <View style={[styles.centerFill, { backgroundColor: R.surface }]}>
        <Text family="noto-sans" size={14} color={R.mutedForeground}>Publicación no encontrada.</Text>
        <TouchableOpacity onPress={() => goBack()} style={{ marginTop: 12 }}>
          <Text family="noto-sans" weight="semibold" size={14} color={Colors.lime}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const kindColors = R.listingKind[listing.kind]

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>
            {kindColors.label.charAt(0) + kindColors.label.slice(1).toLowerCase()}
          </Text>
          <TouchableOpacity onPress={toggleSaved} hitSlop={12}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={19} color={saved ? Colors.lime : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {listing.imageUrl && <Image source={{ uri: listing.imageUrl }} style={styles.hero} resizeMode="cover" />}

        <View style={styles.content}>
          <View style={[styles.chip, { backgroundColor: kindColors.bg }]}>
            <Text family="noto-sans" weight="bold" size={9.5} color={kindColors.text} style={styles.chipText}>
              {kindColors.label}
            </Text>
          </View>
          <Text family="noto-sans" weight="extrabold" size={21} lineHeight={27} color={R.foreground} style={styles.title}>
            {listing.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={R.mutedForeground} />
            <Text family="noto-sans" size={12} color={R.mutedForeground}>
              {listing.location} · {listing.modality}
            </Text>
          </View>
          <Text family="noto-sans" size={14} lineHeight={22} color="#3A3A44" style={styles.description}>
            {listing.description}
          </Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowDivider]}>
              <Text family="noto-sans" size={12.5} color={R.mutedForeground}>Categoría</Text>
              <Text family="noto-sans" weight="semibold" size={12.5} color={R.foreground}>{listing.categoryLabel}</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowDivider]}>
              <Text family="noto-sans" size={12.5} color={R.mutedForeground}>Publicado</Text>
              <Text family="noto-sans" weight="semibold" size={12.5} color={R.foreground}>{timeAgo(listing.publishedAt)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text family="noto-sans" size={12.5} color={R.mutedForeground}>Publica</Text>
              <Text family="noto-sans" weight="semibold" size={12.5} color={R.foreground}>{listing.publisherName}</Text>
            </View>
          </View>

          {others.length > 0 && (
            <>
              <Text family="noto-sans" weight="medium" size={10.5} color={R.mutedForeground2} style={styles.othersEyebrow}>
                TAMBIÉN TE PUEDE INTERESAR
              </Text>
              <View style={styles.othersList}>
                {others.map((other) => {
                  const otherColors = R.listingKind[other.kind]
                  return (
                    <TouchableOpacity
                      key={other.id}
                      style={styles.otherCard}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/(main)/listing/${other.id}` as any)}
                    >
                      <View style={[styles.chip, { backgroundColor: otherColors.bg }]}>
                        <Text family="noto-sans" weight="bold" size={9.5} color={otherColors.text} style={styles.chipText}>
                          {otherColors.label}
                        </Text>
                      </View>
                      <Text family="noto-sans" weight="bold" size={14} lineHeight={19} color={R.foreground}>
                        {other.title}
                      </Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={13} color={R.mutedForeground} />
                        <Text family="noto-sans" size={11.5} color={R.mutedForeground}>
                          {other.location} · {other.modality}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.actionBar}>
        <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85} onPress={handleContact} disabled={!listing.contactUrl}>
          <Text family="noto-sans" weight="bold" size={13} color="#FFFFFF">Ver contacto</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
    paddingBottom: 16,
  },
  hero: { width: '100%', height: 190 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  chip: { alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  chipText: { letterSpacing: 0.5 },
  title: { marginTop: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  description: { marginTop: 14 },
  table: { backgroundColor: R.secondary, borderRadius: 16, paddingHorizontal: 14, marginTop: 18 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  tableRowDivider: { borderBottomWidth: 1, borderBottomColor: '#E9E9E2' },
  othersEyebrow: { letterSpacing: 0.6, marginTop: 22, marginBottom: 10 },
  othersList: { gap: 10 },
  otherCard: { borderWidth: 1, borderColor: '#EDEDE6', borderRadius: 14, padding: 13, gap: 6 },
  actionBar: {
    backgroundColor: R.surface,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E2',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  contactBtn: { flex: 1, backgroundColor: R.foreground, borderRadius: 9999, paddingVertical: 13, alignItems: 'center' },
})
