import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { PointsPill } from '@/components/v2/PointsPill'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { HOME_TEXT as T } from '@/lib/feed-v2/labels'
import { getDepartmentLabel, getProfessionLabel } from '@/lib/mock-data'

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? T.morning : h < 19 ? T.afternoon : T.evening
}

// Saludo del Inicio (como la v1): "Buen día, Marce", profesión · departamento, y "Ordenar intereses".
// Sin sesión invita a entrar (y recuerda los puntos de bienvenida).
export function HomeGreeting({ onOrder }: { onOrder: () => void }) {
  const { user, session } = useApp()
  const firstName = user?.name.trim().split(' ')[0]

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text family="noto-sans" weight="extrabold" size={28} lineHeight={32} color={Colors.v2.navy} style={styles.title}>
            {session && firstName ? `${greeting()}, ${firstName}` : greeting()}
          </Text>
          <Text family="noto-sans" size={14} color={Colors.v2.muted} numberOfLines={1}>
            {session && user ? `${getProfessionLabel(user.profession)} · ${getDepartmentLabel(user.department)}` : T.guestSubtitle}
          </Text>
        </View>
        {session ? <PointsPill light /> : null}
      </View>
      {session ? (
        <TouchableOpacity onPress={onOrder} accessibilityRole="button" style={styles.order}>
          <Ionicons name="options-outline" size={16} color={Colors.v2.navy} />
          <Text family="noto-sans" weight="semibold" size={14} color={Colors.v2.navy}>{T.order}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} accessibilityRole="button" style={[styles.order, styles.login]}>
          <Ionicons name="log-in-outline" size={16} color={Colors.v2.white} />
          <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.white}>{T.login}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  title: { letterSpacing: -0.6 },
  order: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', height: 38, paddingHorizontal: 14, borderRadius: 19, borderWidth: 1, borderColor: Colors.v2.light.inputBorder, backgroundColor: Colors.v2.surface },
  login: { backgroundColor: Colors.v2.navy, borderColor: Colors.v2.navy },
})
