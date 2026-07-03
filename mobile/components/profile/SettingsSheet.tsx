import { useRef, useEffect, type ReactNode } from 'react'
import { View, Animated, Pressable, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Spacing } from '@/constants/spacing'

const { height: SCREEN_H } = Dimensions.get('window')

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  heightRatio?: number
}

export function SettingsSheet({ title, onClose, children, heightRatio = 0.6 }: Props) {
  const C = useColors()
  const SHEET_H = SCREEN_H * heightRatio
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
  }, [])

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_H, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose)
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { height: SHEET_H, backgroundColor: C.surface, borderColor: C.border, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.handle, { backgroundColor: C.border }]} />
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text variant="subtitle" weight="semibold" family="poppins">{title}</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={C.muted} />
          </TouchableOpacity>
        </View>
        {children}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: Spacing[3] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
})
