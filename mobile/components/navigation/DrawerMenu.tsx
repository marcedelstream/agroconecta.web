import { useRef, useEffect, useState } from 'react'
import {
  View,
  Animated,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Colors } from '@/constants/colors'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { useLocalAvatar } from '@/lib/local-avatar-context'
import { Radius, Spacing } from '@/constants/spacing'
import { SERVICES } from '@/lib/services-data'

const { width: SCREEN_W } = Dimensions.get('window')
const DRAWER_W = Math.min(SCREEN_W * 0.78, 320)

interface Props {
  onClose: () => void
}

export function DrawerMenu({ onClose }: Props) {
  const C = useColors()
  const insets = useSafeAreaInsets()
  const { user, signOut } = useApp()
  const { avatarUri } = useLocalAvatar()
  const initial = user?.name.trim().charAt(0).toUpperCase() ?? '?'
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(DRAWER_W)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  function handleClose(route?: string) {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: DRAWER_W, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
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
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={() => handleClose()}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => handleClose()} />
        </Animated.View>

        <Animated.View style={[styles.drawer, { backgroundColor: C.surface, borderLeftColor: C.border, transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={[styles.drawerHeader, { paddingTop: insets.top + Spacing[2] }]}>
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
              <Ionicons name="information-circle-outline" size={16} color={Colors.lime} />
            </View>
            <Text variant="caption" weight="medium">Nosotros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/aliados')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="people-outline" size={16} color={Colors.lime} />
            </View>
            <Text variant="caption" weight="medium">Directorio de Aliados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/contacto')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="mail-outline" size={16} color={Colors.lime} />
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
                <Ionicons name={svc.icon} size={16} color={Colors.lime} />
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
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text family="noto-sans" weight="bold" size={12} color={Colors.lime}>{initial}</Text>
              </View>
            )}
            <Text variant="caption" weight="medium">Ver perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setLogoutModalVisible(true)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: `${Colors.destructive}15` }]}>
              <Ionicons name="log-out-outline" size={16} color={Colors.destructive} />
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
    </Modal>
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
    paddingBottom: Spacing[1],
  },
  itemsContainer: { paddingHorizontal: Spacing[4], paddingTop: Spacing[1], paddingBottom: Spacing[6] },
  sectionLabel: {
    paddingHorizontal: Spacing[2],
    paddingTop: Spacing[1],
    paddingBottom: Spacing[0.5],
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2.5],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.md,
  },
  menuItemLabel: { flex: 1 },
  menuIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: `${Colors.lime}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.lime}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 28, height: 28, borderRadius: 14 },
})
