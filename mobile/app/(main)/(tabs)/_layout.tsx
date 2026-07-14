import { useEffect, useState } from 'react'
import { View, Platform, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { AppHeaderBar } from '@/components/navigation/AppHeaderBar'
import { DrawerMenu } from '@/components/navigation/DrawerMenu'
import { useColors } from '@/lib/theme-context'
import { fetchLiveVideos } from '@/lib/supabase-repositories'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'
import type { Post } from '@/lib/types'

const LIVE_POLL_INTERVAL = 60_000

type IconName = React.ComponentProps<typeof Ionicons>['name']

const tabs: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'home', title: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { name: 'ecosystem', title: 'Descubrir', icon: 'compass-outline', activeIcon: 'compass' },
  { name: 'prices', title: 'Precios', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  { name: 'profile', title: 'Perfil', icon: 'person-circle-outline', activeIcon: 'person-circle' },
]

export default function TabsLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [liveVideos, setLiveVideos] = useState<Post[]>([])
  const C = useColors()

  useEffect(() => {
    let mounted = true
    function poll() {
      fetchLiveVideos()
        .then((data) => { if (mounted) setLiveVideos(data) })
        .catch(() => { if (mounted) setLiveVideos([]) })
    }
    poll()
    const interval = setInterval(poll, LIVE_POLL_INTERVAL)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={[styles.headerSafe, { backgroundColor: C.surface }]}>
        <AppHeaderBar onMenuPress={() => setMenuOpen(true)} liveVideos={liveVideos} />
      </SafeAreaView>

      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'none',
          tabBarStyle: [styles.tabBar, { backgroundColor: C.surface, borderTopColor: C.border }],
          tabBarActiveTintColor: Colors.lime,
          tabBarInactiveTintColor: C.muted,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons name={focused ? tab.activeIcon : tab.icon} size={size} color={color} />
              ),
            }}
          />
        ))}
      </Tabs>

      {menuOpen && <DrawerMenu onClose={() => setMenuOpen(false)} />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerSafe: {},
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    height: Platform.OS === 'ios' ? 80 : 62,
  },
  tabLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    marginTop: 2,
  },
})
