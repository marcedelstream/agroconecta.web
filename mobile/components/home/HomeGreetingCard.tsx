import { TextInput, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'
import { getDepartmentLabel, getProfessionLabel } from '@/lib/mock-data'
import type { UserProfile } from '@/lib/types'

const R = Colors.redesign

interface Props {
  user: UserProfile
  search: string
  onSearchChange: (value: string) => void
  onAdjustInterestsPress: () => void
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buen día'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// Scrollea con el resto del contenido (a diferencia de HomeTopBar) — por eso tiene el
// borde inferior redondeado propio, como una card más dentro del feed.
export function HomeGreetingCard({ user, search, onSearchChange, onAdjustInterestsPress }: Props) {
  const firstName = user.name.trim().split(' ')[0] || user.name

  return (
    <View style={styles.card}>
      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <Text family="noto-sans" weight="bold" size={20} color="#FFFFFF">
            {getGreeting()}, {firstName}
          </Text>
          <Text family="noto-sans" size={12.5} color={R.header.mutedText}>
            {getProfessionLabel(user.profession)} · {getDepartmentLabel(user.department)}
          </Text>
        </View>
        <TouchableOpacity onPress={onAdjustInterestsPress} style={styles.adjustChip} activeOpacity={0.8}>
          <Text family="noto-sans" weight="semibold" size={11.5} color="#C9C9D2">Ajustar interés</Text>
          <Ionicons name="swap-vertical-outline" size={13} color="#C9C9D2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={17} color={R.header.placeholder} />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Buscar precios, remates, noticias"
          placeholderTextColor={R.header.placeholder}
          style={styles.searchInput}
          autoCorrect={false}
          blurOnSubmit={false}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: R.header.bg,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  greetingText: { gap: 3, flexShrink: 1 },
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.header.chip,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.notoSans,
    fontSize: 13.5,
    color: '#FFFFFF',
    padding: 0,
  },
})
