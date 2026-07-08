import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { SectionHeader } from './SectionHeader'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { UPCOMING_PLATFORMS } from '@/lib/ecosystem-data'

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
      <View style={styles.row}>
        {UPCOMING_PLATFORMS.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[styles.tile, { backgroundColor: C.surface, borderColor: C.border }]}
            activeOpacity={0.75}
            onPress={() => router.push(`/(main)/platform/${platform.id}` as any)}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${C.muted}10` }]}>
              <Ionicons name={platform.icon} size={24} color={C.muted} />
            </View>
            <Text variant="caption" weight="semibold" style={{ color: C.foreground, textAlign: 'center' }} numberOfLines={2}>
              {platform.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing[3] },
  tile: {
    flex: 1,
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
