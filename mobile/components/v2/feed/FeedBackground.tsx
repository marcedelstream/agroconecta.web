import { memo, useEffect, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import YoutubePlayer from 'react-native-youtube-iframe'
import { GlassCircle } from '@/components/v2/feed/GlassCircle'
import { Colors } from '@/constants/colors'
import { FEED_TEXT } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'

const F = Colors.v2.feed
// Más ancha que esto = apaisada → va entera sobre una copia desenfocada (el contenido actual es
// casi todo horizontal; ver PLAN-IMPLEMENTACION H3).
const PORTRAIT_MAX_RATIO = 0.8
const PLAY_SIZE = 76

function youtubeVideoId(url: string | null): string | null {
  const match = url?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

interface Props {
  item: FeedContentItem
  active: boolean
}

function FeedBackgroundBase({ item, active }: Props) {
  const { width } = useWindowDimensions()
  // Arranca asumiendo apaisada (el caso común) para no saltar de "cover" a "contain" al cargar.
  const [portrait, setPortrait] = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoId = item.mediaKind === 'youtube' ? youtubeVideoId(item.youtubeUrl) : null

  // Un solo reproductor montado en todo el feed: el del item visible (PLAN H2).
  useEffect(() => {
    if (!active) setPlaying(false)
  }, [active])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {item.mediaUrl ? (
        <>
          {!portrait && (
            <Image source={item.mediaUrl} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={24} recyclingKey={`${item.key}-bg`} />
          )}
          <Image
            source={item.mediaUrl}
            style={StyleSheet.absoluteFill}
            contentFit={portrait ? 'cover' : 'contain'}
            recyclingKey={item.key}
            transition={150}
            onLoad={(e) => setPortrait(e.source.width / e.source.height <= PORTRAIT_MAX_RATIO)}
            accessibilityIgnoresInvertColors
          />
        </>
      ) : (
        <LinearGradient colors={F.fallback} style={StyleSheet.absoluteFill} />
      )}

      <LinearGradient colors={F.shade} locations={F.shadeStops} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {videoId && playing && active && (
        <View style={styles.playerWrap}>
          <YoutubePlayer
            height={(width * 9) / 16}
            width={width}
            videoId={videoId}
            play
            onChangeState={(state: string) => {
              if (state === 'ended') setPlaying(false)
            }}
          />
        </View>
      )}

      {videoId && !playing && (
        <View style={styles.playWrap} pointerEvents="box-none">
          <GlassCircle size={PLAY_SIZE} onPress={() => setPlaying(true)} accessibilityLabel={FEED_TEXT.play}>
            <Ionicons name="play" size={30} color={Colors.v2.white} style={styles.playIcon} />
          </GlassCircle>
        </View>
      )}
    </View>
  )
}

export const FeedBackground = memo(FeedBackgroundBase)

const styles = StyleSheet.create({
  playerWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  playWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // El triángulo de "play" se ve corrido a la izquierda si se centra por caja.
  playIcon: { marginLeft: 4 },
})
