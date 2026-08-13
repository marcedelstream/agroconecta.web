import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ServiceLeadForm } from '@/components/ui/ServiceLeadForm'
import { Colors } from '@/constants/colors'

const R = Colors.redesign

const BENEFITS: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }[] = [
  { icon: 'megaphone-outline', text: 'Publicá remates, empleos, clasificados y cursos en el Ecosistema' },
  { icon: 'calendar-outline', text: 'Cargá tus propios eventos en la Agenda del sector' },
  { icon: 'heart-outline', text: 'Apoyás el desarrollo de una plataforma gratuita para todo el agro paraguayo' },
]

export default function SumateScreen() {
  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="ribbon-outline" size={28} color={Colors.lime} />
        </View>
        <Text family="noto-sans" weight="extrabold" size={23} lineHeight={30} color={R.foreground}>
          Sumate a la iniciativa Agroconecta
        </Text>
        <Text family="noto-sans" size={14} lineHeight={22} color={R.mutedForeground} style={styles.intro}>
          Con la membresía anual podés publicar tu propio contenido en el ecosistema — no hace falta ser
          una organización para tener presencia en la app.
        </Text>

        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitIconBox}>
                <Ionicons name={b.icon} size={18} color={R.limeSoftText} />
              </View>
              <Text family="noto-sans" size={13.5} lineHeight={19} color={R.foreground} style={styles.benefitText}>
                {b.text}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text family="noto-sans" weight="bold" size={15} color={R.foreground} style={styles.formTitle}>
            Solicitá tu membresía
          </Text>
          <Text family="noto-sans" size={12.5} lineHeight={18} color={R.mutedForeground} style={styles.formSubtitle}>
            Dejanos tu contacto y te escribimos para coordinar el pago y activarla.
          </Text>
          <ServiceLeadForm
            serviceId="membresia-anual"
            serviceLabel="Membresía anual Agroconecta"
            infoPlaceholder="Contanos qué te gustaría publicar (empleos, clasificados, cursos, eventos)..."
            submitLabel="Solicitar membresía"
            successTitle="¡Listo, ya tenemos tu solicitud!"
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: `${Colors.lime}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  intro: { marginTop: 10 },
  benefits: { marginTop: 22, gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  benefitIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: R.limeSoftBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1, marginTop: 6 },
  formCard: { backgroundColor: R.secondary, borderRadius: 16, padding: 16, marginTop: 26 },
  formTitle: {},
  formSubtitle: { marginTop: 3, marginBottom: 16 },
})
