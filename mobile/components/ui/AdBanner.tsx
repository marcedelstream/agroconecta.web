import { useEffect, useState } from 'react'
import { View, TouchableOpacity, useWindowDimensions, StyleSheet, Linking, type ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Text } from './Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { fetchActiveBanners } from '@/lib/supabase-repositories'
import type { AdCampaign, AdPlacement, AdSegment } from '@/lib/types'

const R = Colors.redesign

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

function matchesSegment(banner: AdCampaign, segment?: AdSegment): boolean {
  if (!segment) return true
  const professionMatch = !banner.targetProfessions?.length || banner.targetProfessions.includes(segment.profession)
  const departmentMatch = !banner.targetDepartments?.length || banner.targetDepartments.includes(segment.department)
  const categoryMatch = !banner.targetCategories?.length || banner.targetCategories.some((cat) => segment.categories.includes(cat))
  return professionMatch && departmentMatch && categoryMatch
}

function pickRandomBanner(banners: AdCampaign[], segment?: AdSegment): AdCampaign | null {
  if (banners.length === 0) return null
  const matched = banners.filter((b) => matchesSegment(b, segment))
  const pool = matched.length > 0 ? matched : banners
  return pool[Math.floor(Math.random() * pool.length)]
}

interface Props {
  segment?: AdSegment
  placement?: AdPlacement
  refreshKey?: number
  style?: ViewStyle
}

export function AdBanner({ segment, placement = 'home', refreshKey, style }: Props) {
  const { width } = useWindowDimensions()
  const bannerWidth = width - Spacing[5] * 2
  const [banner, setBanner] = useState<AdCampaign | null>(null)
  const segmentKey = segment ? `${segment.profession}|${segment.department}|${segment.categories.join(',')}` : ''

  useEffect(() => {
    fetchActiveBanners(placement)
      .then((data) => setBanner(pickRandomBanner(data, segment)))
      .catch(() => {})
    // segment se resume en segmentKey para no refetchear por una referencia nueva del objeto en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement, segmentKey, refreshKey])

  if (!banner) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.labelRow}>
          <Text family="noto-sans" size={9} color={R.mutedForeground} style={styles.labelText}>Publicidad</Text>
        </View>
        <View style={[styles.placeholder, { backgroundColor: R.secondary, borderColor: R.border, width: bannerWidth }]}>
          <Text family="noto-sans" weight="semibold" size={14} color={R.mutedForeground}>Espacio disponible</Text>
          <Text family="noto-sans" size={12} color={R.mutedForeground}>640 × 200 px</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text family="noto-sans" size={9} color={R.mutedForeground} style={styles.labelText}>Publicidad</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.92}
        disabled={!banner.linkType || !banner.linkTarget}
        onPress={() => openBanner(banner)}
      >
        <Image
          source={{ uri: banner.imageUrl }}
          style={[styles.image, { width: bannerWidth }]}
          contentFit="cover"
          transition={300}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: { alignSelf: 'flex-end', marginBottom: 3 },
  labelText: { letterSpacing: 0.5 },
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
})
