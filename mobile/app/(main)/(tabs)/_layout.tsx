import { useState } from 'react'
import { View, Platform, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { AppHeaderBar } from '@/components/navigation/AppHeaderBar'
import { DrawerMenu } from '@/components/navigation/DrawerMenu'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'

type IconName = React.ComponentProps<typeof Ionicons>['name']

const tabs: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'home', title: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { name: 'prices', title: 'Precios', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  { name: 'videos', title: 'Videos', icon: 'play-circle-outline', activeIcon: 'play-circle' },
  { name: 'ecosystem', title: 'Descubrir', icon: 'compass-outline', activeIcon: 'compass' },
]

export default function TabsLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const C = useColors()

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={[styles.headerSafe, { backgroundColor: C.surface }]}>
        <AppHeaderBar onMenuPress={() => setMenuOpen(true)} />
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
