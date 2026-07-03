import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ServiceLeadForm } from '@/components/ui/ServiceLeadForm'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { SERVICES } from '@/lib/services-data'

export default function ServiceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const C = useColors()
  const insets = useSafeAreaInsets()
  const service = SERVICES.find((s) => s.id === slug)

  if (!service) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <Text variant="body" style={{ color: C.muted }}>Servicio no encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing[2] }}>
          <Text variant="body" style={{ color: Colors.lime }}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <View style={[styles.header, { paddingTop: insets.top + Spacing[2], borderColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }} numberOfLines={1}>
          {service.label}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing[5], paddingBottom: insets.bottom + Spacing[8], gap: Spacing[6] }}>
        <View style={{ gap: Spacing[3] }}>
          <View style={[styles.iconBox, { backgroundColor: `${Colors.lime}15` }]}>
            <Ionicons name={service.icon} size={26} color={Colors.lime} />
          </View>
          <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground }}>
            {service.label}
          </Text>
          <Text variant="body" style={{ color: C.muted, lineHeight: 22 }}>
            {service.description}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <ServiceLeadForm initialServiceId={service.id} />
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1 },
})
