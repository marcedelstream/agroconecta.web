import { useEffect, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { openAdLink, pickInlineAd, trackAdEvent } from '@/lib/feed-v2/ads'
import { AD_TEXT } from '@/lib/feed-v2/labels'
import type { AdCampaign } from '@/lib/types'

const THUMB = 64

// Publicidad dentro de la noticia (README §3.2): bloque "PATROCINADO" entre el primer y el segundo
// párrafo, con "¿Por qué lo veo?", miniatura, anunciante, título, bajada y "Conocer más".
export function InlineAdBlock({ onNavigate }: { onNavigate: () => void }) {
  const { user } = useApp()
  const [ad, setAd] = useState<AdCampaign | null>(null)

  useEffect(() => {
    let alive = true
    pickInlineAd(user).then((a) => {
      if (!alive || !a) return
      setAd(a)
      void trackAdEvent(a.id, 'impression', 'article_inline', user?.department)
    })
    return () => {
      alive = false
    }
    // Una vez por apertura de la ficha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ad) return null

  function why() {
    if (!ad) return
    void trackAdEvent(ad.id, 'why_opened', 'article_inline', user?.department)
    Alert.alert(AD_TEXT.whyTitle, AD_TEXT.whyBody, [{ text: AD_TEXT.whyOk }])
  }

  function open() {
    if (!ad) return
    void trackAdEvent(ad.id, 'click', 'article_inline', user?.department)
    onNavigate()
    openAdLink(ad.linkType ?? null, ad.linkTarget ?? null)
  }

  return (
    <View style={styles.card} accessibilityLabel={AD_TEXT.chip}>
      <View style={styles.head}>
        <Text family="noto-sans" weight="bold" size={11} color={Colors.v2.muted} style={styles.label}>{AD_TEXT.chip}</Text>
        <TouchableOpacity onPress={why} hitSlop={8} accessibilityRole="button">
          <Text family="noto-sans" weight="semibold" size={12} color={Colors.v2.muted}>{AD_TEXT.why}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Image source={ad.imageUrl} style={styles.thumb} contentFit="cover" />
        <View style={styles.texts}>
          {ad.advertiserName ? <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.limeText}>{ad.advertiserName}</Text> : null}
          <Text family="noto-sans" weight="extrabold" size={16} lineHeight={20} color={Colors.v2.navy} numberOfLines={2}>{ad.title}</Text>
          {ad.body ? <Text family="noto-sans" size={13} color={Colors.v2.muted} numberOfLines={2}>{ad.body}</Text> : null}
        </View>
      </View>
      {ad.linkTarget ? (
        <TouchableOpacity onPress={open} style={styles.cta} accessibilityRole="button">
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy}>{AD_TEXT.learnMore}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, backgroundColor: Colors.v2.surface, borderWidth: 1, borderColor: Colors.v2.light.inputBorder, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.v2.light.cardBorder },
  label: { letterSpacing: 1.1 },
  body: { flexDirection: 'row', gap: 14, padding: 14, alignItems: 'center' },
  thumb: { width: THUMB, height: THUMB, borderRadius: 14 },
  texts: { flex: 1, gap: 4 },
  cta: { marginHorizontal: 14, marginBottom: 14, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.v2.sheet.border, backgroundColor: Colors.v2.ground, alignItems: 'center', justifyContent: 'center' },
})
