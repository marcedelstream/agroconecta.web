import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { useColors } from '@/lib/theme-context'

const WIDTH = 46
const HEIGHT = 27
const THUMB = 23
const PADDING = 2

interface Props {
  value: boolean
  onValueChange: (value: boolean) => void
}

// Reemplaza el <Switch> nativo — su animación es controlada por el SO (abrupta en Android)
// y no se puede afinar. Este toggle usa un spring propio para que se sienta más premium.
export function AnimatedToggle({ value, onValueChange }: Props) {
  const C = useColors()
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      speed: 22,
      bounciness: 6,
    }).start()
  }, [value, anim])

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [PADDING, WIDTH - THUMB - PADDING] })
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [C.border, Colors.lime] })

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onValueChange(!value)
  }

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: { width: WIDTH, height: HEIGHT, borderRadius: HEIGHT / 2, justifyContent: 'center' },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
})
