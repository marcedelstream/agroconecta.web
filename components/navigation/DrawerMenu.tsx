import { useRef, useEffect } from 'react'
import {
  View,
  Animated,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useColors, useTheme } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'

const { width: SCREEN_W } = Dimensions.get('window')
const DRAWER_W = Math.min(SCREEN_W * 0.78, 320)
const darkLogo = require('@/assets/images/logo-dark.png')
const lightLogo = require('@/assets/images/logo-light.png')

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface MenuItem {
  icon: IconName
  label: string
  section: string | null
  route?: string
  badge?: string
}

const menuItems: MenuItem[] = [
  { icon: 'newspaper-outline', label: 'Noticias', section: null, route: '/(main)/home' },
  { icon: 'trending-up-outline', label: 'Precios de Mercado', section: null, route: '/(main)/prices' },
  { icon: 'play-circle-outline', label: 'Galería de Videos', section: null, route: '/(main)/videos' },
  { icon: 'globe-outline', label: 'Ecosistema Digital', section: null, route: '/(main)/ecosystem' },
  { icon: 'calendar-outline', label: 'Eventosagropy', section: null, route: '/(main)/webview?siteId=1' },
  { icon: 'notifications-outline', label: 'Alertas y Avisos', section: 'Servicios', badge: 'Próximo' },
  { icon: 'cloudy-outline', label: 'AgroClima', section: null, badge: 'Próximo' },
  { icon: 'storefront-outline', label: 'AgroMercado', section: null, badge: 'Próximo' },
  { icon: 'person-outline', label: 'Mi Perfil', section: 'Cuenta', route: '/(main)/profile' },
  { icon: 'settings-outline', label: 'Configuración', section: null, route: '/(main)/profile' },
  { icon: 'information-circle-outline', label: 'Acerca de Agroconecta', section: null },
]

interface Props {
  onClose: () => void
}

export function DrawerMenu({ onClose }: Props) {
  const C = useColors()
  const { isDark } = useTheme()
  const slideAnim = useRef(new Animated.Value(DRAWER_W)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start()
  }, [])

  function handleClose(route?: string) {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: DRAWER_W, duration: 240, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      onClose()
      if (route) router.push(route as any)
    })
  }

  let lastSection: string | null = '__none__'

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => handleClose()} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View style={[styles.drawer, { backgroundColor: C.surface, borderLeftColor: C.border, transform: [{ translateX: slideAnim }] }]}>
        {/* Drawer header */}
        <View style={[styles.drawerHeader, { borderBottomColor: C.border }]}>
          <Image
            source={isDark ? darkLogo : lightLogo}
            style={styles.drawerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => handleClose()} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.itemsContainer}>
          {menuItems.map((item) => {
            const showSection = item.section && item.section !== lastSection
            if (item.section) lastSection = item.section
            const isDisabled = !item.route

            return (
              <View key={item.label}>
                {showSection && (
                  <Text variant="label" color={Colors.muted} style={styles.sectionLabel}>
                    {item.section!.toUpperCase()}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  onPress={() => !isDisabled && handleClose(item.route)}
                >
                  <View style={[styles.menuIconBox, isDisabled && styles.menuIconBoxDim]}>
                    <Ionicons
                      name={item.icon}
                      size={19}
                      color={isDisabled ? Colors.muted : Colors.lime}
                    />
                  </View>
                  <Text
                    variant="body"
                    weight="medium"
                    style={isDisabled ? { color: Colors.muted } : undefined}
                  >
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View style={styles.comingSoonBadge}>
                      <Text variant="label" style={styles.comingSoonText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )
          })}
        </ScrollView>

        <View style={[styles.drawerFooter, { borderTopColor: C.border }]}>
          <Text variant="caption" color={Colors.muted}>© 2026 Agroconecta</Text>
          <Text variant="caption" color={Colors.muted}>v1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_W,
    borderLeftWidth: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[14],
    paddingBottom: Spacing[5],
    borderBottomWidth: 1,
  },
  drawerLogo: { height: 28, width: 120 },
  itemsContainer: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[3] },
  sectionLabel: {
    paddingHorizontal: Spacing[2],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[1],
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.md,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: `${Colors.lime}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBoxDim: { backgroundColor: `${Colors.muted}15` },
  comingSoonBadge: {
    marginLeft: 'auto',
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  comingSoonText: { color: Colors.muted, fontSize: 10 },
  drawerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    borderTopWidth: 1,
  },
})
