import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Spacing } from '@/constants/spacing'
import { useColors, useTheme } from '@/lib/theme-context'

const darkLogo = require('@/assets/images/logo-dark.png')
const lightLogo = require('@/assets/images/logo-light.png')

interface Props {
  onMenuPress: () => void
}

export function AppHeaderBar({ onMenuPress }: Props) {
  const C = useColors()
  const { isDark } = useTheme()
  return (
    <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
      <Image
        source={isDark ? darkLogo : lightLogo}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} hitSlop={12}>
        <Ionicons name="menu-outline" size={28} color={C.foreground} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  logo: {
    height: 32,
    width: 140,
  },
  menuBtn: {
    padding: Spacing[1],
  },
})
