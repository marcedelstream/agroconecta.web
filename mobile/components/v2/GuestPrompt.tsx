import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface Props {
  icon: IconName
  title: string
  body: string
}

const CTA = 'Iniciar sesión'

// Para las pantallas de cuenta (Guardados, Karai…) cuando se navega como invitado: explica qué se
// gana entrando, en vez de mostrar un error.
export function GuestPrompt({ icon, title, body }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={30} color={Colors.v2.navy} />
      </View>
      <Text family="noto-sans" weight="extrabold" size={20} lineHeight={25} color={Colors.v2.navy} style={styles.center}>{title}</Text>
      <Text family="noto-sans" size={15} lineHeight={22} color={Colors.v2.muted} style={styles.center}>{body}</Text>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')} accessibilityRole="button" style={styles.cta}>
        <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.navy}>{CTA}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.v2.surface, borderRadius: 24, padding: 24, alignItems: 'center', gap: 10 },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  center: { textAlign: 'center' },
  cta: { alignSelf: 'stretch', height: 50, borderRadius: 25, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
})
