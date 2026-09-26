import { memo, useEffect, useRef } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { ContentCTA } from '@/components/v2/feed/ContentCTA'
import { TypeChip } from '@/components/v2/feed/TypeChip'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { openAdLink, trackAdEvent } from '@/lib/feed-v2/ads'
import { AD_TEXT } from '@/lib/feed-v2/labels'
import type { FeedSponsoredItem } from '@/lib/feed-v2/types'

const F = Colors.v2.feed
// Mismo umbral que una impresión de contenido (BACKEND §3.1).
const IMPRESSION_MS = 600

interface Props {
  item: FeedSponsoredItem
  height: number
  active: boolean
}

// Patrocinado en el feed (README §3.1): un item más, pero con el chip blanco "PATROCINADO" y punto
// ámbar para distinguirlo siempre del contenido orgánico, y el link para pautar.
function SponsoredSlideBase({ item, height, active }: Props) {
  const { ctaBottom, contentBottom, side } = useFeedInsets()
  const { user } = useApp()
  const counted = useRef(false)

  useEffect(() => {
    if (!active || counted.current) return
    const t = setTimeout(() => {
      counted.current = true
      void trackAdEvent(item.campaignId, 'impression', 'feed', user?.department)
    }, IMPRESSION_MS)
    return () => clearTimeout(t)
  }, [active, item.campaignId, user?.department])

  function why() {
    void trackAdEvent(item.campaignId, 'why_opened', 'feed', user?.department)
    Alert.alert(AD_TEXT.whyTitle, AD_TEXT.whyBody, [{ text: AD_TEXT.whyOk }])
  }

  function open() {
    void trackAdEvent(item.campaignId, 'click', 'feed', user?.department)
    openAdLink(item.linkType, item.linkTarget)
  }

  return (
    <View style={[styles.slide, { height }]}>
      <Image source={item.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={item.key} />
      <LinearGradient colors={F.shade} locations={F.shadeStops} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={[styles.info, { bottom: contentBottom, left: side, right: side }]}>
        <View style={styles.meta}>
          <TypeChip label={AD_TEXT.chip} sponsored />
          {item.advertiserName ? (
            <Text family="noto-sans" weight="semibold" size={14} color={F.textOrg} numberOfLines={1} style={styles.flex}>{item.advertiserName}</Text>
          ) : null}
        </View>
        <Text family="noto-sans" weight="extrabold" size={26} lineHeight={30} color={Colors.v2.white} numberOfLines={3}>{item.title}</Text>
        {item.body ? <Text family="noto-sans" size={15} lineHeight={21} color={F.textSoft} numberOfLines={3}>{item.body}</Text> : null}
        <View style={styles.links}>
          <TouchableOpacity onPress={why} hitSlop={8} accessibilityRole="button">
            <Text family="noto-sans" weight="semibold" size={13} color={F.textSoft} style={styles.underline}>{AD_TEXT.why}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(main)/pautar' as never)} hitSlop={8} accessibilityRole="link">
            <Text family="noto-sans" weight="semibold" size={13} color={F.textSoft} style={styles.underline}>{AD_TEXT.pautar}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {item.linkTarget ? <ContentCTA type="patrocinado" customLabel={item.ctaLabel} bottom={ctaBottom} side={side} onPress={open} /> : null}
    </View>
  )
}

export const SponsoredSlide = memo(SponsoredSlideBase)

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden', backgroundColor: Colors.v2.navy },
  info: { position: 'absolute', gap: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flexShrink: 1 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  underline: { textDecorationLine: 'underline' },
})
