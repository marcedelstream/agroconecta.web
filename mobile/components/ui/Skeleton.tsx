import { useEffect, useRef } from 'react'
import { Animated, View, StyleSheet, type ViewStyle } from 'react-native'
import { useColors } from '@/lib/theme-context'
import { Radius } from '@/constants/spacing'

interface Props {
  width?: number | `${number}%`
  height?: number
  radius?: number
  style?: ViewStyle
}

export function Skeleton({ width = '100%', height = 16, radius = Radius.sm, style }: Props) {
  const C = useColors()
  const opacity = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: C.secondary, opacity },
        style,
      ]}
    />
  )
}

// Placeholder de una tarjeta de noticia en grid (imagen arriba + 2 líneas de texto)
export function NewsCardGridSkeleton() {
  const C = useColors()
  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Skeleton height={140} radius={0} />
      <View style={styles.content}>
        <Skeleton height={13} width="90%" />
        <Skeleton height={13} width="60%" />
        <Skeleton height={10} width="40%" style={{ marginTop: 4 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { flexBasis: '48%', flexGrow: 1, borderRadius: Radius.base, overflow: 'hidden', borderWidth: 1 },
  content: { padding: 10, gap: 6 },
})
