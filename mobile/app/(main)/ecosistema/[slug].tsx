import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ServiceLeadForm } from '@/components/ui/ServiceLeadForm'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { UPCOMING_PLATFORMS } from '@/lib/ecosystem-data'

export default function EcosistemaDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const C = useColors()
  const insets = useSafeAreaInsets()
  const platform = UPCOMING_PLATFORMS.find((p) => p.id === slug)

  if (!platform) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <Text variant="body" style={{ color: C.muted }}>Plataforma no encontrada.</Text>
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
          {platform.name}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing[5], paddingBottom: insets.bottom + Spacing[8], gap: Spacing[6] }}>
        <View style={{ gap: Spacing[3] }}>
          <View style={styles.iconRow}>
            <View style={[styles.iconBox, { backgroundColor: `${Colors.lime}15` }]}>
              <Ionicons name={platform.icon} size={26} color={Colors.lime} />
            </View>
            <View style={styles.proximoBadge}>
              <Text style={styles.proximoText}>PRÓXIMAMENTE</Text>
            </View>
          </View>
          <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground }}>
            {platform.name}
          </Text>
          <Text variant="body" style={{ color: C.muted, lineHeight: 22 }}>
            {platform.description}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <View style={{ gap: Spacing[2] }}>
          <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>
            ¿Querés cargar tu información acá?
          </Text>
          <Text variant="body" style={{ color: C.muted, lineHeight: 22 }}>
            Esta sección todavía está en construcción. Dejanos tu contacto y contanos qué te gustaría
            publicar en {platform.name} — te avisamos apenas esté disponible.
          </Text>
        </View>

        <ServiceLeadForm
          serviceId={`ecosistema-${platform.id}`}
          serviceLabel={`Ecosistema — ${platform.name}`}
          infoPlaceholder={`Contanos qué información querés cargar en ${platform.name}...`}
          submitLabel="Enviar interés"
          successTitle="¡Listo, ya tenemos tu interés!"
        />
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proximoBadge: {
    backgroundColor: 'rgba(139,139,154,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  proximoText: { fontSize: 10, color: '#8B8B9A', fontWeight: '700', letterSpacing: 0.5 },
  divider: { height: 1 },
})
