import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

const HEART_SIZE = 96
const DOUBLE_TAP_MAX_DELAY_MS = 250

interface Props {
  onDoubleTap: () => void
  children: React.ReactNode
}

// Doble toque sobre la foto = me gusta, con el corazón que aparece donde se tocó. Solo marca, nunca
// desmarca (para quitar el me gusta está el botón de la barra lateral), igual que en otras apps.
// Envuelve solo el fondo: la info tiene pointerEvents="none" y deja pasar el toque; los botones
// de la barra y el de acción quedan por encima y siguen respondiendo al toque simple.
export function DoubleTapLike({ onDoubleTap, children }: Props) {
  const [point, setPoint] = useState({ x: 0, y: 0 })
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)

  const gesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(DOUBLE_TAP_MAX_DELAY_MS)
    .runOnJS(true)
    .onEnd((e, success) => {
      if (!success) return
      setPoint({ x: e.x, y: e.y })
      scale.value = withSequence(withTiming(0, { duration: 0 }), withSpring(1, { damping: 9, stiffness: 220 }))
      opacity.value = withSequence(withTiming(1, { duration: 80 }), withDelay(450, withTiming(0, { duration: 250 })))
      onDoubleTap()
    })

  const heartStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: '-8deg' }],
  }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={StyleSheet.absoluteFill}>
        {children}
        <Animated.View
          pointerEvents="none"
          style={[styles.heart, { left: point.x - HEART_SIZE / 2, top: point.y - HEART_SIZE / 2 }, heartStyle]}
        >
          <Ionicons name="heart" size={HEART_SIZE} color={Colors.v2.feed.heart} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  heart: {
    position: 'absolute',
    width: HEART_SIZE,
    height: HEART_SIZE,
    shadowColor: Colors.v2.nav.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
})
