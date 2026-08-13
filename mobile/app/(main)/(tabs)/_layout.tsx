import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Tabs, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'

type IconName = React.ComponentProps<typeof Ionicons>['name']

// Inicio y Ecosistema quedan en la tab bar; Precios, Noticias y Perfil siguen siendo rutas
// navegables (desde "Ver todos" del tablero de precios, el avatar de la cabecera, etc.)
// pero salen de la barra — ver docs/design_handoff_home_redesign. Cada tab ya trae su
// propia cabecera embebida — nada de eso vive acá para evitar el parpadeo que causaba
// decidir el header a mostrar según el pathname en este layout persistente.
const tabs: { name: string; title: string; icon: IconName; activeIcon: IconName; inTabBar: boolean }[] = [
  { name: 'ecosystem', title: 'Ecosistema', icon: 'grid-outline', activeIcon: 'grid', inTabBar: true },
  { name: 'prices', title: 'Precios', icon: 'trending-up-outline', activeIcon: 'trending-up', inTabBar: false },
  { name: 'noticias', title: 'Noticias', icon: 'newspaper-outline', activeIcon: 'newspaper', inTabBar: false },
  { name: 'profile', title: 'Perfil', icon: 'person-circle-outline', activeIcon: 'person-circle', inTabBar: false },
]

// Botón "+" flotante del medio. Ojo: NO deja que el tab navigator haga el cambio de tab
// por default (no llama a props.onPress) — en cambio empuja (push) directo a la pantalla
// correspondiente. Si dejáramos que cambie de tab y después esa pantalla hiciera un
// router.replace(), la pantalla quedaba sin historial y "atrás" tiraba el error
// "GO_BACK was not handled by any navigator".
function PublishTabButton({ accessibilityState }: BottomTabBarButtonProps) {
  const { user } = useApp()

  function handlePress() {
    if (user?.isMember) {
      router.push('/(main)/publish-form' as any)
    } else {
      router.push('/(main)/sumate' as any)
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={styles.publishButtonWrap}
      accessibilityState={accessibilityState}
    >
      <View style={styles.publishButtonCircle}>
        <Ionicons name="add" size={30} color="#0A0A13" />
      </View>
    </TouchableOpacity>
  )
}

export default function TabsLayout() {
  const C = useColors()

  return (
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
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: '',
          tabBarButton: (props) => <PublishTabButton {...props} />,
        }}
      />
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            href: tab.inTabBar ? undefined : null,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

const styles = StyleSheet.create({
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
  publishButtonWrap: { flex: 1, alignItems: 'center' },
  publishButtonCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -26,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
})
