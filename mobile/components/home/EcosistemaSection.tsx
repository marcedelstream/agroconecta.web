import { View, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { SectionHeader } from './SectionHeader'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { UPCOMING_PLATFORMS, type UpcomingPlatform } from '@/lib/ecosystem-data'

function showComingSoon(platform: UpcomingPlatform) {
  Alert.alert(`${platform.name} — Próximamente`, platform.description)
}

interface Props {
  onViewAll?: () => void
}

export function EcosistemaSection({ onViewAll }: Props) {
  const C = useColors()

  return (
    <View>
      <SectionHeader
        title="Ecosistema"
        action={onViewAll ? { label: 'Ver todo', onPress: onViewAll } : undefined}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.row}>
        {UPCOMING_PLATFORMS.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[styles.tile, { backgroundColor: C.surface, borderColor: C.border }]}
            activeOpacity={0.75}
            onPress={() => showComingSoon(platform)}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${C.muted}10` }]}>
              <Ionicons name={platform.icon} size={24} color={C.muted} />
            </View>
            <Text variant="caption" weight="semibold" style={{ color: C.foreground, textAlign: 'center' }} numberOfLines={2}>
              {platform.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -Spacing[5] },
  row: { flexDirection: 'row', gap: Spacing[3], paddingLeft: Spacing[5], paddingRight: Spacing[2] },
  tile: {
    width: 100,
    borderRadius: Radius.base,
    borderWidth: 1,
    paddingVertical: Spacing[3.5],
    paddingHorizontal: Spacing[2],
    alignItems: 'center',
    gap: Spacing[2],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
