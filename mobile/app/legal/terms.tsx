import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Spacing } from '@/constants/spacing'

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Aceptación de los términos',
    body: 'Al crear una cuenta o utilizar Agroconecta aceptás estos Términos de Uso. Si no estás de acuerdo con alguno de los puntos, no debés utilizar la aplicación.',
  },
  {
    title: '2. Descripción del servicio',
    body: 'Agroconecta es una plataforma digital que centraliza noticias, precios de mercado, eventos y contenido del ecosistema agropecuario paraguayo, tanto para productores como para profesionales del sector.',
  },
  {
    title: '3. Cuentas de usuario',
    body: 'Sos responsable de mantener la confidencialidad de tus credenciales de acceso y de toda actividad realizada desde tu cuenta. Debés proporcionar información veraz al momento de registrarte.',
  },
  {
    title: '4. Contenido de terceros',
    body: 'Las noticias, precios y publicaciones que aparecen en la app pueden provenir de organizaciones, medios e instituciones asociadas. Agroconecta no se responsabiliza por la exactitud del contenido publicado por terceros, aunque trabaja para verificar la calidad editorial de sus fuentes.',
  },
  {
    title: '5. Uso permitido',
    body: 'No está permitido usar la app para fines ilegales, difundir información falsa, ni intentar vulnerar la seguridad de la plataforma o de otros usuarios.',
  },
  {
    title: '6. Propiedad intelectual',
    body: 'Las marcas, logotipos y el diseño de Agroconecta son propiedad de sus titulares. El contenido de cada organización pertenece a quien lo publica.',
  },
  {
    title: '7. Modificaciones',
    body: 'Estos términos pueden actualizarse periódicamente. El uso continuado de la app después de una actualización implica la aceptación de los nuevos términos.',
  },
  {
    title: '8. Contacto',
    body: 'Ante cualquier consulta sobre estos Términos de Uso podés escribirnos a través de los canales de contacto disponibles dentro de la app.',
  },
]

export default function TermsScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <View style={[styles.header, { paddingTop: insets.top + Spacing[2], borderColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>
          Términos de uso
        </Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing[5], paddingBottom: insets.bottom + Spacing[8], gap: Spacing[5] }}>
        {SECTIONS.map((s) => (
          <View key={s.title} style={{ gap: Spacing[1.5] }}>
            <Text variant="body" weight="semibold" style={{ color: C.foreground }}>{s.title}</Text>
            <Text variant="body" style={{ color: C.muted, lineHeight: 22 }}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
})
