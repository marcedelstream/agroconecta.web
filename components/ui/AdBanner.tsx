import { useEffect, useState } from 'react'
import { Image, TouchableOpacity, View, StyleSheet, type ImageSourcePropType, type ViewStyle } from 'react-native'
import { Text } from './Text'
import { useColors } from '@/lib/theme-context'
import { selectAd } from '@/lib/ad-segments'
import { Radius } from '@/constants/spacing'
import type { AdSegment } from '@/lib/types'

const LOCAL_BANNERS: Record<string, ImageSourcePropType> = {
  'livestock-credit': require('@/assets/banners/ganaderia-creditos.png'),
  'agrochem-seed': require('@/assets/banners/semillas-zafra.png'),
  'animal-health': require('@/assets/banners/sanidad-animal.png'),
  'precision-ag': require('@/assets/banners/precision-agro.png'),
  'trading-platform': require('@/assets/banners/mercados-granos.png'),
  'regional-coop': require('@/assets/banners/cooperativa-regional.png'),
}

interface Props {
  segment?: AdSegment
  style?: ViewStyle
}

export function AdBanner({ segment, style }: Props) {
  const C = useColors()
  const [remoteFailed, setRemoteFailed] = useState(false)
  const ad = segment ? selectAd(segment) : selectAd({
    profession: 'productor',
    department: 'central',
    categories: ['ganaderia'],
  })
  const localSource = LOCAL_BANNERS[ad.id]
  const imageSource = remoteFailed || !ad.imageUrl ? localSource : { uri: ad.imageUrl }

  useEffect(() => {
    setRemoteFailed(false)
  }, [ad.id])

  return (
    <View style={[styles.container, style]}>
      <View style={styles.label}>
        <Text variant="label" style={[styles.labelText, { color: C.muted }]}>Publicidad</Text>
      </View>
      {imageSource ? (
        <TouchableOpacity activeOpacity={0.9} style={[styles.imageCard, { backgroundColor: C.secondary, borderColor: C.border }]}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" onError={() => setRemoteFailed(true)} />
        </TouchableOpacity>
      ) : (
        <View style={[styles.placeholder, { backgroundColor: C.secondary, borderColor: C.border }]}>
          <Text variant="caption" style={{ color: C.muted }}>Zocalo publicitario 320 x 100 px</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { alignSelf: 'flex-end', marginBottom: 3 },
  labelText: { fontSize: 9, letterSpacing: 0.5 },
  imageCard: {
    height: 100,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: {
    height: 100,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
