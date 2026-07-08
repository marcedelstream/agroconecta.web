import { useEffect, useRef, useState } from 'react'
import { View, FlatList, TouchableOpacity, useWindowDimensions, StyleSheet, Linking, type ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Text } from './Text'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { Colors } from '@/constants/colors'
import { fetchActiveBanners } from '@/lib/supabase-repositories'
import type { AdCampaign, AdPlacement } from '@/lib/types'

function openBanner(banner: AdCampaign) {
  if (!banner.linkType || !banner.linkTarget) return
  switch (banner.linkType) {
    case 'event':
      router.push(`/event/${banner.linkTarget}`)
      return
    case 'post':
      router.push(`/article/${banner.linkTarget}`)
      return
    case 'url':
      Linking.openURL(banner.linkTarget).catch(() => {})
      return
    case 'course':
      // Cursos todavía no tiene pantalla propia — se agrega cuando se construya esa feature.
      return
  }
}

const SLIDE_INTERVAL = 4000

interface Props {
  segment?: unknown
  placement?: AdPlacement
  style?: ViewStyle
}

export function AdBanner({ placement = 'home', style }: Props) {
  const C = useColors()
  const { width } = useWindowDimensions()
  const bannerWidth = width - Spacing[5] * 2
  const [banners, setBanners] = useState<AdCampaign[]>([])
  const [index, setIndex] = useState(0)
  const listRef = useRef<FlatList<AdCampaign>>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setBanners([])
    fetchActiveBanners(placement)
      .then((data) => { if (data.length > 0) setBanners(data) })
      .catch(() => {})
  }, [placement])

  useEffect(() => {
    if (banners.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % banners.length
        listRef.current?.scrollToIndex({ index: next, animated: true })
        return next
      })
    }, SLIDE_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [banners.length])

  if (banners.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.labelRow}>
          <Text variant="label" style={[styles.labelText, { color: C.muted }]}>Publicidad</Text>
        </View>
        <View style={[styles.placeholder, { backgroundColor: C.secondary, borderColor: C.border, width: bannerWidth }]}>
          <Text variant="body" weight="semibold" style={{ color: C.muted }}>Espacio disponible</Text>
          <Text variant="caption" style={{ color: C.muted }}>640 × 200 px</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text variant="label" style={[styles.labelText, { color: C.muted }]}>Publicidad</Text>
      </View>

      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={banners.length > 1}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / bannerWidth)
          setIndex(newIndex)
        }}
        getItemLayout={(_, i) => ({ length: bannerWidth, offset: bannerWidth * i, index: i })}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            style={{ width: bannerWidth }}
            disabled={!item.linkType || !item.linkTarget}
            onPress={() => openBanner(item)}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.image, { width: bannerWidth }]}
              contentFit="cover"
              transition={300}
            />
          </TouchableOpacity>
        )}
      />

      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? Colors.lime : C.border },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: { alignSelf: 'flex-end', marginBottom: 3 },
  labelText: { fontSize: 9, letterSpacing: 0.5 },
  placeholder: {
    height: 100,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
  },
  image: {
    height: 100,
    borderRadius: Radius.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[1.5],
    marginTop: Spacing[2],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
