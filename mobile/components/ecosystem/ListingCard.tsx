import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import type { EcosystemListing } from '@/lib/types'

const R = Colors.redesign

interface Props {
  listing: EcosystemListing
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

// Molde único para empleo/clasificado/curso (boceto 4f) — solo cambia la
// etiqueta de categoría y su color.
export function ListingCard({ listing, onPress, style }: Props) {
  const kindColors = R.listingKind[listing.kind]

  return (
    <TouchableOpacity style={[styles.card, style]} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: kindColors.bg }]}>
            <Text family="noto-sans" weight="bold" size={9.5} color={kindColors.text} style={styles.chipText}>
              {kindColors.label}
            </Text>
          </View>
          {listing.isFree && (
            <View style={[styles.chip, styles.freeChip]}>
              <Text family="noto-sans" weight="bold" size={9.5} color={Colors.lime} style={styles.chipText}>
                GRATIS
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={17} color="#A8A8B2" />
      </View>
      <Text family="noto-sans" weight="bold" size={14.5} lineHeight={19} color={R.foreground} numberOfLines={2}>
        {listing.title}
      </Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={11.5} color={R.mutedForeground} />
        <Text family="noto-sans" size={11.5} color={R.mutedForeground} numberOfLines={1} style={{ flex: 1 }}>
          {listing.location} · {listing.modality}
        </Text>
      </View>
      <Text family="noto-sans" size={12.5} lineHeight={18} color="#5A5A66" numberOfLines={2}>
        {listing.description}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: R.surface, borderRadius: 16, padding: 14, gap: 7 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chipsRow: { flexDirection: 'row', gap: 6 },
  chip: { alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  freeChip: { backgroundColor: `${Colors.lime}18` },
  chipText: { letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
})
