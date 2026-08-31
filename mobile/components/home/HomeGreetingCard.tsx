import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { getDepartmentLabel, getProfessionLabel } from '@/lib/mock-data'
import type { UserProfile } from '@/lib/types'

const R = Colors.redesign

interface Props {
  user: UserProfile | null
  onAdjustInterestsPress: () => void
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buen día'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function HomeGreetingCard({ user, onAdjustInterestsPress }: Props) {
  if (!user) {
    return (
      <View style={styles.card}>
        <View style={styles.greetingRow}>
          <TouchableOpacity
            style={styles.greetingText}
            activeOpacity={0.75}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text family="noto-sans" weight="bold" size={20} color="#FFFFFF">
              {getGreeting()}
            </Text>
            <View style={styles.roleRow}>
              <Text family="noto-sans" size={12.5} color={R.header.mutedText}>
                Iniciá sesión para personalizar tu experiencia
              </Text>
              <Ionicons name="chevron-forward" size={13} color={Colors.lime} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.adjustChip} activeOpacity={0.8}>
            <Text family="noto-sans" weight="semibold" size={11.5} color="#C9C9D2">Iniciar sesión</Text>
            <Ionicons name="log-in-outline" size={13} color="#C9C9D2" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const firstName = user.name.trim().split(' ')[0] || user.name

  return (
    <View style={styles.card}>
      <View style={styles.greetingRow}>
        <TouchableOpacity
          style={styles.greetingText}
          activeOpacity={0.75}
          onPress={() => router.push('/(main)/(tabs)/profile' as any)}
        >
          <Text family="noto-sans" weight="bold" size={20} color="#FFFFFF">
            {getGreeting()}, {firstName}
          </Text>
          <View style={styles.roleRow}>
            <Text family="noto-sans" size={12.5} color={R.header.mutedText}>
              {getProfessionLabel(user.profession)} · {getDepartmentLabel(user.department)}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.lime} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAdjustInterestsPress} style={styles.adjustChip} activeOpacity={0.8}>
          <Text family="noto-sans" weight="semibold" size={11.5} color="#C9C9D2">Ajustar interés</Text>
          <Ionicons name="swap-vertical-outline" size={13} color="#C9C9D2" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: R.header.bg,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  greetingText: { gap: 3, flexShrink: 1 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  adjustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    borderRadius: 9999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    flexShrink: 0,
  },
})
