import { useState } from 'react'
import { View, Platform, StyleSheet } from 'react-native'
import { Tabs, useSegments } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { AppHeaderBar } from '@/components/navigation/AppHeaderBar'
import { DrawerMenu } from '@/components/navigation/DrawerMenu'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'

// Rutas que tienen su propio header completo — ocultar el shared header
const FULL_SCREEN_ROUTES = ['webview', 'publisher']

type IconName = React.ComponentProps<typeof Ionicons>['name']

const tabs: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'home', title: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { name: 'prices', title: 'Precios', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  { name: 'videos', title: 'Videos', icon: 'play-circle-outline', activeIcon: 'play-circle' },
  { name: 'ecosystem', title: 'Ecosistema', icon: 'globe-outline', activeIcon: 'globe' },
]

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const segments = useSegments()
  const C = useColors()
  const isFullScreen = segments.some((segment) => FULL_SCREEN_ROUTES.includes(String(segment)))

  return (
    <View style={styles.root}>
      {/* Header estático — oculto en pantallas con su propio header */}
      {!isFullScreen && (
        <SafeAreaView edges={['top']} style={[styles.headerSafe, { backgroundColor: C.surface }]}>
          <AppHeaderBar onMenuPress={() => setMenuOpen(true)} />
        </SafeAreaView>
      )}

      {/* Contenido de tabs */}
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'shift',
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
        {/* Rutas sin tab bar */}
        <Tabs.Screen
          name="article/[id]"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="publisher/[id]"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="webview"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="video/[id]"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>

      {/* Drawer de menú — overlay sobre todo */}
      {menuOpen && <DrawerMenu onClose={() => setMenuOpen(false)} />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafe: {},
  tabBar: {
    borderTopWidth: 1,
    // Sin altura fija: deja que el safe area inset de iOS/Android sea manejado por RN
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
