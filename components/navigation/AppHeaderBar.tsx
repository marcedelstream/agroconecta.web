import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
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
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push('/(main)/profile')} style={styles.iconBtn} hitSlop={12}>
          <Ionicons name="person-circle-outline" size={26} color={C.foreground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn} hitSlop={12}>
          <Ionicons name="menu-outline" size={28} color={C.foreground} />
        </TouchableOpacity>
      </View>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  iconBtn: {
    padding: Spacing[1],
  },
})
