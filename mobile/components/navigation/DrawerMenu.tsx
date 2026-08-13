import { useRef, useEffect, useState } from 'react'
import {
  View,
  Animated,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Colors } from '@/constants/colors'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { Radius, Spacing } from '@/constants/spacing'
import { SERVICES } from '@/lib/services-data'

const { width: SCREEN_W } = Dimensions.get('window')
const DRAWER_W = Math.min(SCREEN_W * 0.78, 320)

interface Props {
  onClose: () => void
}

export function DrawerMenu({ onClose }: Props) {
  const C = useColors()
  const { user, signOut } = useApp()
  const initial = user?.name.trim().charAt(0).toUpperCase() ?? '?'
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(DRAWER_W)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start()
  }, [])

  function handleClose(route?: string) {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: DRAWER_W, duration: 140, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      onClose()
      if (route) router.push(route as any)
    })
  }

  async function confirmLogout() {
    setLogoutModalVisible(false)
    await signOut()
    onClose()
    router.replace('/(auth)/login')
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => handleClose()} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { backgroundColor: C.surface, borderLeftColor: C.border, transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => handleClose()} hitSlop={12}>
            <Ionicons name="close" size={22} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.itemsContainer}>
          {/* INSTITUCIONAL */}
          <Text variant="label" color={Colors.muted} style={styles.sectionLabel}>INSTITUCIONAL</Text>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/nosotros')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="information-circle-outline" size={19} color={Colors.lime} />
            </View>
            <Text variant="caption" weight="medium">Nosotros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/aliados')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="people-outline" size={19} color={Colors.lime} />
            </View>
            <Text variant="caption" weight="medium">Directorio de Aliados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/contacto')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="mail-outline" size={19} color={Colors.lime} />
            </View>
            <Text variant="caption" weight="medium">Contacto</Text>
          </TouchableOpacity>

          {/* SERVICIOS */}
          <Text variant="label" color={Colors.muted} style={[styles.sectionLabel, { marginTop: Spacing[4] }]}>SERVICIOS</Text>
          {SERVICES.map((svc) => (
            <TouchableOpacity
              key={svc.id}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleClose(`/(main)/service/${svc.id}`)}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={svc.icon} size={19} color={Colors.lime} />
              </View>
              <Text variant="caption" weight="medium">{svc.label}</Text>
            </TouchableOpacity>
          ))}

          {/* CUENTA */}
          <Text variant="label" color={Colors.muted} style={[styles.sectionLabel, { marginTop: Spacing[4] }]}>CUENTA</Text>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/(tabs)/profile')}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text variant="caption" weight="medium">Ver perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setLogoutModalVisible(true)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: `${Colors.destructive}15` }]}>
              <Ionicons name="log-out-outline" size={19} color={Colors.destructive} />
            </View>
            <Text variant="caption" weight="medium">Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      <ConfirmModal
        visible={logoutModalVisible}
        icon="log-out-outline"
        destructive
        title="Cerrar sesión"
        message="¿Seguro que querés cerrar sesión?"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
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
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[12],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  itemsContainer: { paddingHorizontal: Spacing[4], paddingTop: Spacing[3], paddingBottom: Spacing[10] },
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
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${Colors.lime}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.lime,
  },
})
