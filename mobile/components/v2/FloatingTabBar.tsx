import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Text } from '@/components/ui/Text'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { MaterialNavBar } from '@/components/v2/MaterialNavBar'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'

import { TAB_META, V2_TAB_ROUTES, type V2TabRoute } from '@/components/v2/tabs-config'

export { V2_TAB_ROUTES } from '@/components/v2/tabs-config'

const N = Colors.v2.nav

// Alto que ocupa la barra flotante desde el borde inferior: las pantallas v2 lo usan como
// padding inferior de su contenido para que nada quede tapado.
export function useFloatingTabBarSpace() {
  const insets = useSafeAreaInsets()
  if (Platform.OS === 'android') return V2Layout.android.navHeight + insets.bottom
  return V2Layout.navHeight + V2Layout.navBottom + insets.bottom
}

// iOS: barra flotante de vidrio. Android: barra acoplada de Material You (misma arquitectura).
export function FloatingTabBar(props: BottomTabBarProps) {
  return Platform.OS === 'android' ? <MaterialNavBar {...props} /> : <GlassTabBar {...props} />
}

function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const currentName = state.routes[state.index]?.name
  // En Inicio la barra va sobre la foto del feed; en el resto, sobre fondos claros.
  const dark = currentName === 'feed'

  function go(name: V2TabRoute) {
    const route = state.routes.find((r) => r.name === name)
    if (!route) return
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
    if (currentName !== name && !event.defaultPrevented) {
      Haptics.selectionAsync().catch(() => null)
      navigation.navigate(name)
    }
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: V2Layout.navBottom + insets.bottom }]}
      accessibilityRole="tablist"
    >
      <GlassSurface
        tint={dark ? 'dark' : 'light'}
        intensity={60}
        overlayColor={dark ? N.darkBg : N.lightBg}
        androidColor={dark ? N.darkBgAndroid : N.lightBgAndroid}
        borderColor={dark ? N.darkBorder : N.lightBorder}
        style={[StyleSheet.absoluteFill, styles.bg]}
      />
      {V2_TAB_ROUTES.map((name) => {
        const focused = currentName === name
        if (name === 'karai') {
          return (
            <Pressable
              key={name}
              onPress={() => go(name)}
              style={styles.karai}
              accessibilityRole="tab"
              accessibilityLabel="Karai"
              accessibilityState={{ selected: focused }}
            >
              <Ionicons name="sparkles" size={26} color={Colors.v2.navy} />
            </Pressable>
          )
        }
        const meta = TAB_META[name]
        const color = focused ? (dark ? N.darkActive : N.lightActive) : dark ? N.darkIdle : N.lightIdle
        return (
          <Pressable
            key={name}
            onPress={() => go(name)}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityLabel={meta.label}
            accessibilityState={{ selected: focused }}
          >
            <Ionicons name={focused ? meta.activeIcon : meta.icon} size={24} color={color} />
            <Text family="noto-sans" weight={focused ? 'bold' : 'medium'} size={10} lineHeight={13} color={color}>
              {meta.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: V2Layout.navSide,
    right: V2Layout.navSide,
    height: V2Layout.navHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    borderRadius: V2Layout.navRadius,
    shadowColor: N.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  bg: { borderRadius: V2Layout.navRadius },
  item: {
    width: V2Layout.navItemWidth,
    height: V2Layout.navItemHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  karai: {
    width: V2Layout.karaiSize,
    height: V2Layout.karaiSize,
    borderRadius: V2Layout.karaiSize / 2,
    backgroundColor: Colors.v2.lime,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -V2Layout.karaiLift }],
    shadowColor: Colors.v2.lime,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
})
