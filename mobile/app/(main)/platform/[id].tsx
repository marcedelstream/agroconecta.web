import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { UPCOMING_PLATFORMS } from '@/lib/ecosystem-data'

export default function PlatformScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const C = useColors()
  const insets = useSafeAreaInsets()
  const platform = UPCOMING_PLATFORMS.find((p) => p.id === id)

  if (!platform) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Text variant="body" style={{ color: C.muted }}>Plataforma no encontrada.</Text>
        <TouchableOpacity onPress={() => router.navigate('/(main)/(tabs)/ecosystem' as any)} style={{ marginTop: Spacing[3] }}>
          <Text variant="body" style={{ color: Colors.lime }}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.navigate('/(main)/(tabs)/ecosystem' as any)} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={{ color: C.foreground }}>{platform.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing[8] }]}
      >
        {/* Icono + nombre */}
        <View style={styles.heroSection}>
          <View style={[styles.bigIcon, { backgroundColor: `${C.muted}10` }]}>
            <Ionicons name={platform.icon} size={52} color={C.muted} />
          </View>
          <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground, textAlign: 'center' }}>
            {platform.name}
          </Text>
          <View style={styles.proximoBadge}>
            <Text style={styles.proximoText}>PRÓXIMAMENTE</Text>
          </View>
        </View>

        {/* Descripción */}
        <Text variant="body" style={{ color: C.foreground, lineHeight: 24, textAlign: 'center' }}>
          {platform.description}
        </Text>

        <View style={[styles.ctaBtnDisabled, { borderColor: C.border }]}>
          <Ionicons name="time-outline" size={20} color={C.muted} />
          <Text variant="body" weight="semibold" style={{ color: C.muted }}>
            Disponible próximamente
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  content: { padding: Spacing[5], gap: Spacing[5] },
  heroSection: { alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[4] },
  bigIcon: {
    width: 100,
    height: 100,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  proximoBadge: {
    backgroundColor: 'rgba(139,139,154,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  proximoText: { fontSize: 11, color: '#8B8B9A', fontWeight: '700', letterSpacing: 1 },
  ctaBtnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
  },
})
