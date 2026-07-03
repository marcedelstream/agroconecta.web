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
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useColors, useTheme } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { SERVICES } from '@/lib/services-data'

const { width: SCREEN_W } = Dimensions.get('window')
const DRAWER_W = Math.min(SCREEN_W * 0.78, 320)
const darkLogo = require('@/assets/images/logo-dark.png')
const lightLogo = require('@/assets/images/logo-light.png')

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
      if (route) {
        const { router } = require('expo-router')
        router.push(route)
      }
    })
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => handleClose()} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { backgroundColor: C.surface, borderLeftColor: C.border, transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: C.border }]}>
          <Image source={isDark ? darkLogo : lightLogo} style={styles.drawerLogo} resizeMode="contain" />
          <TouchableOpacity onPress={() => handleClose()} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.itemsContainer}>
          {/* SERVICIOS */}
          <Text variant="label" color={Colors.muted} style={styles.sectionLabel}>SERVICIOS</Text>

          <View style={styles.servicesList}>
            {SERVICES.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={styles.serviceItem}
                activeOpacity={0.7}
                onPress={() => handleClose(`/(main)/service/${svc.id}`)}
              >
                <Ionicons name={svc.icon} size={16} color={Colors.lime} />
                <Text variant="body" weight="medium" style={styles.serviceLabel}>{svc.label}</Text>
                <Ionicons name="chevron-forward" size={15} color={C.muted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>

          {/* CUENTA */}
          <Text variant="label" color={Colors.muted} style={[styles.sectionLabel, { marginTop: Spacing[4] }]}>CUENTA</Text>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/profile')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="settings-outline" size={19} color={Colors.lime} />
            </View>
            <Text variant="body" weight="medium">Configuración</Text>
          </TouchableOpacity>
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
    paddingTop: Spacing[2],
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
  menuItemLabel: { flex: 1 },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: `${Colors.lime}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesList: { gap: 2, marginBottom: Spacing[1] },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2.5],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.md,
  },
  serviceLabel: { flex: 1, fontSize: 13 },
  drawerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    borderTopWidth: 1,
  },
})
