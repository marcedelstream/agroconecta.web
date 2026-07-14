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
export function NewsCardGridSkeleton({ style }: { style?: ViewStyle }) {
  const C = useColors()
  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }, style]}>
      <Skeleton height={140} radius={0} />
      <View style={styles.content}>
        <Skeleton height={13} width="90%" />
        <Skeleton height={13} width="60%" />
        <Skeleton height={10} width="40%" style={{ marginTop: 4 }} />
      </View>
    </View>
  )
}

// Placeholder del carrusel destacado (mismo alto que FeaturedGrid)
export function HeroCarouselSkeleton() {
  return <Skeleton height={240} radius={Radius.xl} />
}

// Placeholder de una tarjeta de video en grid (thumbnail 16:9 + 2 líneas de texto)
export function VideoCardSkeleton({ style }: { style?: ViewStyle }) {
  const C = useColors()
  return (
    <View style={[styles.videoCard, { backgroundColor: C.surface, borderColor: C.border }, style]}>
      <Skeleton height={100} radius={0} />
      <View style={styles.content}>
        <Skeleton height={13} width="85%" />
        <Skeleton height={13} width="55%" />
        <View style={styles.metaRow}>
          <Skeleton height={9} width="35%" />
          <Skeleton height={9} width="20%" />
        </View>
      </View>
    </View>
  )
}

// Placeholder de una tapa de libro (portada 5:7 + 2 líneas de texto)
export function BookCardSkeleton() {
  return (
    <View style={styles.bookCard}>
      <Skeleton height={168} radius={Radius.md} />
      <Skeleton height={12} width="90%" style={{ marginTop: 6 }} />
      <Skeleton height={10} width="60%" style={{ marginTop: 4 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { flexBasis: '48%', borderRadius: Radius.base, overflow: 'hidden', borderWidth: 1 },
  content: { padding: 10, gap: 6 },
  videoCard: { flexBasis: '47%', flexGrow: 1, borderRadius: Radius.base, overflow: 'hidden', borderWidth: 1 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  bookCard: { width: 120 },
})
