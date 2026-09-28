import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Spacing } from '@/constants/spacing'

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Aceptación de los términos",
    body: "Al crear una cuenta o utilizar Agroconecta aceptás estos Términos de Uso y la Política de privacidad. Si no estás de acuerdo con alguno de los puntos, no debés utilizar la aplicación.",
  },
  {
    title: "2. Descripción del servicio",
    body: "Agroconecta es una plataforma digital que centraliza noticias, precios de mercado, eventos, remates, transmisiones en vivo y contenido del ecosistema agropecuario paraguayo, con un asistente (Karai) y un programa de puntos.",
  },
  {
    title: "3. Cuentas de usuario",
    body: "Podés ver contenido sin cuenta; para guardar, seguir, recordar, usar Karai o sumar puntos necesitás iniciar sesión. Sos responsable de la confidencialidad de tu acceso y de la actividad de tu cuenta, y debés dar información veraz. Cada persona puede tener una sola cuenta.",
  },
  {
    title: "4. Contenido de terceros y publicidad",
    body: "Las noticias, precios, eventos y publicaciones pueden provenir de organizaciones, medios e instituciones asociadas. Agroconecta no se responsabiliza por la exactitud del contenido de terceros, aunque trabaja para verificar la calidad de sus fuentes. Los anuncios están marcados como \"Patrocinado\".",
  },
  {
    title: "5. Karai",
    body: "Karai es un asistente con inteligencia artificial. Sus respuestas son orientativas y pueden tener errores: no reemplazan el consejo de un profesional. Las cuentas gratuitas tienen un límite diario de consultas.",
  },
  {
    title: "6. Programa de puntos",
    body: "Es voluntario y solo para mayores de 18 años residentes en Paraguay. Los puntos no tienen valor en dinero, no se transfieren y vencen tras 12 meses sin movimientos. Cada código de canje vale 60 días y el canje no se cancela. El detalle está en el Reglamento de puntos: agroconecta.com.py/reglamento-puntos.",
  },
  {
    title: "7. Uso permitido",
    body: "No está permitido usar la app para fines ilegales, difundir información falsa, crear varias cuentas o cuentas falsas, ni intentar vulnerar la seguridad de la plataforma o de otros usuarios.",
  },
  {
    title: "8. Propiedad intelectual",
    body: "Las marcas, logotipos y el diseño de Agroconecta son propiedad de sus titulares. El contenido de cada organización pertenece a quien lo publica.",
  },
  {
    title: "9. Modificaciones",
    body: "Estos términos pueden actualizarse. Si el cambio es importante te avisaremos en la app; seguir usándola después implica aceptar los nuevos términos.",
  },
  {
    title: "10. Contacto",
    body: "Ante cualquier consulta sobre estos Términos de Uso escribinos desde agroconecta.com.py/soporte.",
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
