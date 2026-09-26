import { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Colors } from '@/constants/colors'

const WIDTH = 52
const HEIGHT = 32
const KNOB = 26
const PAD = 3
const TRAVEL = WIDTH - KNOB - PAD * 2

interface Props {
  value: boolean
  onChange: (value: boolean) => void
  accessibilityLabel: string
}

// Interruptor de las pantallas claras v2 (mismo dibujo que .sw del prototipo): pista gris → lima.
export function ReminderSwitch({ value, onChange, accessibilityLabel }: Props) {
  const progress = useSharedValue(value ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 })
  }, [value, progress])

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.v2.light.segTrack, Colors.v2.lime]),
  }))
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: progress.value * TRAVEL }] }))

  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: { width: WIDTH, height: HEIGHT, borderRadius: HEIGHT / 2, padding: PAD, justifyContent: 'center' },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: Colors.v2.surface,
    shadowColor: Colors.v2.nav.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
})
