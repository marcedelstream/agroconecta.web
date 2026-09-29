import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Spacing } from '@/constants/spacing'

// Copia de https://www.agroconecta.com.py/politica (web/app/politica/page.tsx): mantener las dos iguales.
const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Qué datos recolectamos",
    body: "Los que nos das: nombre, correo, teléfono (opcional), profesión y departamento; tus rubros, lo que producís, para qué usás la app y tu escala; las organizaciones que seguís; y, si lo completás, tu perfil profesional (cargo, formación, experiencia, especialidades y redes). El departamento lo elegís vos: no usamos la ubicación GPS.\n\nLo que hacés en la app: qué contenido ves y por cuánto tiempo, tus me gusta, guardados, recordatorios, respuestas a encuestas y quiz, tus puntos y canjes, las publicidades que ves o tocás y tus mensajes con Karai. También guardamos el identificador de notificaciones de tu teléfono si las activás. La foto de perfil queda solo en tu teléfono.",
  },
  {
    title: "2. Para qué los usamos",
    body: "Para ordenar tu feed con lo que más te interesa, recomendarte eventos y contenido cercano, sumar y canjear tus puntos, responderte con Karai, mostrarte publicidad acorde a tu profesión, departamento e intereses, enviarte las notificaciones que activaste y entender, de forma agregada, cómo se usa la app para mejorarla.",
  },
  {
    title: "3. Publicidad",
    body: "Los anuncios siempre están marcados como \"Patrocinado\" y podés ver por qué te aparecen. Se eligen con los datos que declaraste en tu perfil; no seguimos lo que hacés en otras apps o sitios. A los anunciantes les mostramos solo resultados agregados, nunca tus datos personales.",
  },
  {
    title: "4. Karai",
    body: "Tus conversaciones con Karai son privadas: el equipo de Agroconecta no las lee. Para generar las respuestas, tus mensajes se procesan con un proveedor de inteligencia artificial. Si en un mensaje mostrás interés comercial (por ejemplo, que querés vender o comprar), guardamos solo ese mensaje para poder contactarte. Si tenés KARAI Campo, los datos de tu establecimiento que cargás en Mi campo (o que mencionás en el chat: hectáreas, animales, cultivos) se usan únicamente para que Karai te responda mejor: no se muestran a nadie, no se venden y no se usan para publicidad. Los podés editar o borrar cuando quieras.",
  },
  {
    title: "5. Perfil público",
    body: "Tu perfil profesional es privado. Solo se puede ver con un link si activás \"Perfil público\" y elegís tu dirección. En ese caso se muestran tu nombre, cargo, formación, experiencia, especialidades y redes; nunca tu correo ni tu teléfono. Lo podés desactivar cuando quieras.",
  },
  {
    title: "6. Puntos y canjes",
    body: "Los puntos que sumás y lo que canjeás quedan registrados en tu cuenta. Al canjear un premio, al aliado le llega solo lo necesario para que lo uses (el código de canje). Las reglas están en el Reglamento de puntos: agroconecta.com.py/reglamento-puntos.",
  },
  {
    title: "7. Con quién compartimos tus datos",
    body: "No vendemos tus datos personales. Solo los procesan los proveedores que la app necesita: base de datos (Supabase), web (Vercel), notificaciones (Expo), inicio de sesión (Google y Apple), correos (Resend) y el proveedor de inteligencia artificial de Karai.",
  },
  {
    title: "8. Almacenamiento y seguridad",
    body: "Tus datos se guardan en Supabase con controles de acceso: cada persona solo puede ver y modificar lo suyo, y lo que tiene valor (puntos, canjes, respuestas del quiz) lo decide el servidor, no la app.",
  },
  {
    title: "9. Tus derechos",
    body: "Podés ver y corregir tus datos desde tu perfil, y pedirnos una copia o la corrección de cualquier dato desde agroconecta.com.py/soporte.",
  },
  {
    title: "10. Eliminación de cuenta",
    body: "Podés eliminar tu cuenta desde Perfil → Más → Eliminar cuenta. Se borran tu perfil, intereses, organizaciones seguidas, guardados, recordatorios, actividad, puntos, canjes y conversaciones con Karai, y no se puede deshacer. Los registros de publicidad quedan solo como números anónimos.",
  },
  {
    title: "11. Notificaciones",
    body: "Son opcionales. Te avisamos de noticias importantes, precios o recordatorios que activaste, solo en las categorías que elegiste. Las podés desactivar desde tu perfil o desde los ajustes del teléfono.",
  },
  {
    title: "12. Cambios a esta política",
    body: "Podemos actualizar esta política cuando la app cambie. Si el cambio es importante, te lo vamos a avisar en la app.",
  },
  {
    title: "13. Contacto",
    body: "Si tenés preguntas sobre tus datos personales, escribinos desde agroconecta.com.py/soporte.",
  },
]

export default function PrivacyScreen() {
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
          Política de privacidad
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
