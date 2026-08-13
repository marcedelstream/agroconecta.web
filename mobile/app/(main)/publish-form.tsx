import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ServiceLeadForm } from '@/components/ui/ServiceLeadForm'
import { Colors } from '@/constants/colors'

const R = Colors.redesign

const TYPES: { key: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'evento', label: 'Evento', icon: 'calendar-outline' },
  { key: 'empleo', label: 'Empleo', icon: 'briefcase-outline' },
  { key: 'clasificado', label: 'Clasificado', icon: 'pricetags-outline' },
  { key: 'curso', label: 'Curso', icon: 'school-outline' },
]

export default function PublishFormScreen() {
  const [selected, setSelected] = useState<string>('evento')
  const type = TYPES.find((t) => t.key === selected)!

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Publicar</Text>
          <View style={{ width: 20 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>¿Qué querés publicar?</Text>
        <View style={styles.typesRow}>
          {TYPES.map((t) => {
            const active = t.key === selected
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeChip, { backgroundColor: active ? R.foreground : R.secondary }]}
                onPress={() => setSelected(t.key)}
                activeOpacity={0.85}
              >
                <Ionicons name={t.icon} size={15} color={active ? '#FFFFFF' : R.foreground} />
                <Text family="noto-sans" weight="semibold" size={12.5} color={active ? '#FFFFFF' : R.foreground}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.formCard}>
          <Text family="noto-sans" size={12.5} lineHeight={18} color={R.mutedForeground} style={styles.formIntro}>
            Contanos los datos de tu {type.label.toLowerCase()} y nuestro equipo lo carga en la app.
          </Text>
          <ServiceLeadForm
            key={selected}
            serviceId={`publicar-${selected}`}
            serviceLabel={`Publicar ${type.label.toLowerCase()}`}
            infoPlaceholder={`Título, descripción, fecha/ubicación y todo lo que quieras contarnos sobre tu ${type.label.toLowerCase()}...`}
            submitLabel="Enviar publicación"
            successTitle="¡Listo, ya la recibimos!"
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 9 },
  formCard: { backgroundColor: R.secondary, borderRadius: 16, padding: 16, marginTop: 22 },
  formIntro: { marginBottom: 16 },
})
