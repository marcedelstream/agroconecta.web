import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Spacing } from '@/constants/spacing'

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Qué datos recolectamos',
    body: 'Recolectamos los datos que nos proporcionás al registrarte: nombre, correo electrónico, teléfono, profesión y departamento. También guardamos tus preferencias de contenido y las organizaciones que decidís seguir.',
  },
  {
    title: '2. Para qué usamos tus datos',
    body: 'Usamos tu información para personalizar el feed de noticias y precios que ves, enviarte notificaciones relevantes (si las activaste) y mejorar la experiencia general de la app.',
  },
  {
    title: '3. Con quién compartimos tus datos',
    body: 'No vendemos tus datos personales a terceros. Solo se comparten con proveedores de servicios necesarios para el funcionamiento de la app (por ejemplo, el envío de notificaciones push o el procesamiento de formularios de contacto).',
  },
  {
    title: '4. Almacenamiento y seguridad',
    body: 'Tus datos se almacenan en infraestructura de Supabase con controles de acceso basados en tu identidad de usuario. Trabajamos para mantener medidas de seguridad razonables acordes al tamaño del proyecto.',
  },
  {
    title: '5. Tus derechos',
    body: 'Podés acceder, corregir o eliminar tus datos personales en cualquier momento desde la sección de Perfil de la app, o solicitándolo a través de los canales de contacto disponibles.',
  },
  {
    title: '6. Notificaciones',
    body: 'Las notificaciones push son opcionales. Podés activarlas o desactivarlas en cualquier momento desde los ajustes de tu dispositivo o desde tu perfil dentro de la app.',
  },
  {
    title: '7. Cambios a esta política',
    body: 'Esta Política de Privacidad puede actualizarse para reflejar cambios en la app o en la normativa aplicable. Te recomendamos revisarla periódicamente.',
  },
  {
    title: '8. Contacto',
    body: 'Si tenés preguntas sobre el tratamiento de tus datos personales, escribinos a través de los canales de contacto disponibles dentro de la app.',
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
