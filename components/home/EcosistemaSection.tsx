import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { SectionHeader } from './SectionHeader'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const PLATFORMS: { id: string; label: string; icon: IoniconName; available: boolean }[] = [
  { id: 'agrojuego', label: 'AgroJuego', icon: 'game-controller-outline', available: true },
  { id: 'agrostore', label: 'AgroStore', icon: 'storefront-outline',       available: false },
  { id: 'agrojobs',  label: 'Agro Jobs', icon: 'briefcase-outline',        available: false },
]

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
        {PLATFORMS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.tile, { backgroundColor: C.surface, borderColor: C.border }]}
            activeOpacity={0.75}
            onPress={() => router.push(`/(main)/platform/${p.id}` as any)}
          >
            <View style={[
              styles.iconWrap,
              { backgroundColor: p.available ? `${Colors.lime}18` : `${C.muted}10` },
            ]}>
              <Ionicons name={p.icon} size={24} color={p.available ? Colors.lime : C.muted} />
            </View>
            <Text
              variant="caption"
              weight="semibold"
              style={{ color: p.available ? C.foreground : C.muted, textAlign: 'center' }}
            >
              {p.label}
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
