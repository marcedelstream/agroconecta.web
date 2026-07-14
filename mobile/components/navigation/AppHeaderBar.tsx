import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors, useTheme } from '@/lib/theme-context'
import type { Post } from '@/lib/types'

const darkLogo = require('@/assets/images/logo-dark.png')
const lightLogo = require('@/assets/images/logo-light.png')

interface Props {
  onMenuPress: () => void
  liveVideos?: Post[]
}

export function AppHeaderBar({ onMenuPress, liveVideos = [] }: Props) {
  const C = useColors()
  const { isDark } = useTheme()

  function handleLivePress() {
    if (liveVideos.length === 1) {
      router.push(`/(main)/video/${liveVideos[0].id}` as any)
    } else {
      router.push('/(main)/videos')
    }
  }

  return (
    <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
      <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/home')} activeOpacity={0.75}>
        <Image
          source={isDark ? darkLogo : lightLogo}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.actions}>
        {liveVideos.length > 0 && (
          <TouchableOpacity onPress={handleLivePress} style={styles.liveBtn} activeOpacity={0.85}>
            <View style={styles.liveDot} />
            <Text variant="label" style={styles.liveText}>EN VIVO</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.push('/(main)/videos')} style={styles.iconBtn} hitSlop={12}>
          <Ionicons name="play-circle-outline" size={26} color={C.foreground} />
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
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.destructive,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 0.4,
  },
})
