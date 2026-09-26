import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Text } from '@/components/ui/Text'
import { TAB_META, V2_TAB_ROUTES, type V2TabRoute } from '@/components/v2/tabs-config'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'

const A = Colors.v2.android
const M = V2Layout.android

// Barra de navegación Android / Material You (prototype/source/Android.dc.html): acoplada abajo,
// indicador en píldora detrás del ícono activo y KARAI como botón cuadrado redondeado.
export function MaterialNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const currentName = state.routes[state.index]?.name
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
      accessibilityRole="tablist"
      style={[styles.bar, { height: M.navHeight + insets.bottom, paddingBottom: insets.bottom, backgroundColor: dark ? A.navDark : A.navLight }]}
    >
      {V2_TAB_ROUTES.map((name) => {
        const focused = currentName === name
        if (name === 'karai') {
          return (
            <Pressable key={name} onPress={() => go(name)} accessibilityRole="tab" accessibilityLabel="Karai" accessibilityState={{ selected: focused }} style={styles.item}>
              <View style={styles.karai}>
                <Ionicons name="sparkles" size={24} color={Colors.v2.navy} />
              </View>
            </Pressable>
          )
        }
        const meta = TAB_META[name]
        const labelColor = focused ? (dark ? A.labelActiveDark : A.activeLight) : dark ? A.idleDark : A.idleLight
        const iconColor = focused ? (dark ? A.iconActiveDark : A.activeLight) : labelColor
        return (
          <Pressable
            key={name}
            onPress={() => go(name)}
            accessibilityRole="tab"
            accessibilityLabel={meta.label}
            accessibilityState={{ selected: focused }}
            style={styles.item}
          >
            <View style={[styles.indicator, focused && { backgroundColor: dark ? A.indicatorDark : A.indicatorLight }]}>
              <Ionicons name={focused ? meta.activeIcon : meta.icon} size={24} color={iconColor} />
            </View>
            <Text family="noto-sans" weight="semibold" size={12} lineHeight={16} color={labelColor}>{meta.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  item: { flex: 1, height: M.navHeight, alignItems: 'center', justifyContent: 'center', gap: 4 },
  indicator: { width: M.indicatorWidth, height: M.indicatorHeight, borderRadius: M.indicatorHeight / 2, alignItems: 'center', justifyContent: 'center' },
  karai: {
    width: M.karaiWidth,
    height: M.karaiHeight,
    borderRadius: M.karaiRadius,
    backgroundColor: Colors.v2.lime,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
})
