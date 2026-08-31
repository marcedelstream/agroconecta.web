import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, Image } from 'react-native'
import { router } from 'expo-router'
import { useApp } from '@/lib/app-context'
import { Colors } from '@/constants/colors'

export default function SplashScreen() {
  const { authLoading, isLoading, session, user } = useApp()
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.85)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start()
  }, [])

  useEffect(() => {
    if (isLoading || authLoading) return
    const timer = setTimeout(() => {
      if (session && !user) {
        router.replace('/(onboarding)')
      } else {
        router.replace('/(main)/(tabs)/home')
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [authLoading, isLoading, session, user])

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.dotsRow, { opacity }]}>
        <LoadingDots />
      </Animated.View>
    </View>
  )
}

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current
  const dot2 = useRef(new Animated.Value(0.3)).current
  const dot3 = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(800),
        ])
      ).start()

    animate(dot1, 0)
    animate(dot2, 200)
    animate(dot3, 400)
  }, [])

  return (
    <View style={styles.dots}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logo: {
    width: 200,
    height: 60,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 80,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lime,
  },
})
