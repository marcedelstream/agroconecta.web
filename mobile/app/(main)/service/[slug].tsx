import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ServiceLeadForm } from '@/components/ui/ServiceLeadForm'
import { Colors } from '@/constants/colors'
import { SERVICES } from '@/lib/services-data'

const R = Colors.redesign

export default function ServiceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const service = SERVICES.find((s) => s.id === slug)

  if (!service) {
    return (
      <View style={[styles.center, { backgroundColor: R.surface }]}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <Text family="noto-sans" size={14} color={R.mutedForeground}>Servicio no encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10 }}>
          <Text family="noto-sans" weight="semibold" size={14} color={Colors.lime}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText} numberOfLines={1}>
            {service.label}
          </Text>
          <View style={{ width: 20 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name={service.icon} size={25} color={Colors.lime} />
        </View>
        <Text family="noto-sans" weight="extrabold" size={20} lineHeight={27} color={R.foreground} style={{ marginTop: 14 }}>
          {service.label}
        </Text>
        <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={{ marginTop: 8 }}>
          {service.description}
        </Text>

        <View style={styles.divider} />

        <ServiceLeadForm serviceId={service.id} serviceLabel={service.label} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  content: { padding: 20, paddingBottom: 40 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: R.limeSoftBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: R.divider, marginVertical: 22 },
})
