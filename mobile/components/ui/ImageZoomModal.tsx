import { useEffect } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

const MAX_SCALE = 5
const DOUBLE_TAP_SCALE = 2.5
const TEXT = {
  close: 'Cerrar',
  hint: 'Pellizcá o tocá dos veces para hacer zoom',
}

interface Props {
  uri: string | null
  onClose: () => void
}

// Imagen a pantalla completa con zoom (pellizcar, arrastrar, doble toque). Pensado para flyers y
// cronogramas, que en el ancho del celular no se leen.
export function ImageZoomModal({ uri, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const savedTx = useSharedValue(0)
  const savedTy = useSharedValue(0)

  useEffect(() => {
    scale.value = 1
    savedScale.value = 1
    tx.value = 0
    ty.value = 0
    savedTx.value = 0
    savedTy.value = 0
  }, [uri, scale, savedScale, tx, ty, savedTx, savedTy])

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(1, savedScale.value * e.scale))
    })
    .onEnd(() => {
      savedScale.value = scale.value
      if (scale.value <= 1.01) {
        tx.value = withTiming(0)
        ty.value = withTiming(0)
        savedTx.value = 0
        savedTy.value = 0
      }
    })

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value <= 1) return
      tx.value = savedTx.value + e.translationX
      ty.value = savedTy.value + e.translationY
    })
    .onEnd(() => {
      savedTx.value = tx.value
      savedTy.value = ty.value
    })

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const next = scale.value > 1 ? 1 : DOUBLE_TAP_SCALE
      scale.value = withTiming(next)
      savedScale.value = next
      if (next === 1) {
        tx.value = withTiming(0)
        ty.value = withTiming(0)
        savedTx.value = 0
        savedTy.value = 0
      }
    })

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap)

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }))

  return (
    <Modal visible={uri !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      {/* Un Modal es otra ventana nativa: los gestos necesitan su propia raíz. */}
      <GestureHandlerRootView style={styles.root}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.fill, imageStyle]}>
            {uri ? <Image source={{ uri }} style={styles.fill} contentFit="contain" /> : null}
          </Animated.View>
        </GestureDetector>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={TEXT.close}
          style={[styles.close, { top: insets.top + 12 }]}
        >
          <Ionicons name="close" size={24} color={Colors.v2.white} />
        </TouchableOpacity>
        <View style={[styles.hint, { bottom: insets.bottom + 20 }]} pointerEvents="none">
          <Text family="noto-sans" size={13} color={Colors.v2.white}>
            {TEXT.hint}
          </Text>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.viewer.bg },
  fill: { flex: 1 },
  close: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.v2.viewer.closeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.v2.viewer.hintBg,
  },
})
