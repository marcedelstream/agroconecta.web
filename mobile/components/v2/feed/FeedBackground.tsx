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
const PLAY_SIZE = 76
const BACKDROP_BLUR = 30
// Las miniaturas hqdefault de YouTube son 4:3 con franjas negras arriba y abajo: se muestran
// como 16:9 recortando esas franjas.
const YOUTUBE_RATIO = 16 / 9

function youtubeVideoId(url: string | null): string | null {
  const match = url?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

/** Tamaño de la imagen entera (sin recortar ni estirar) dentro del slide. */
function fitInside(ratio: number, width: number, height: number) {
  return ratio >= width / height ? { width, height: width / ratio } : { width: height * ratio, height }
}

interface Props {
  item: FeedContentItem
  active: boolean
  height: number
}

// Fondo del item: la imagen en su proporción original, centrada, sobre una copia de sí misma
// desenfocada que llena la pantalla. El tamaño se calcula a mano con las medidas reales de la
// imagen en vez de confiar en contentFit, para que nunca se vea estirada.
function FeedBackgroundBase({ item, active, height }: Props) {
  const { width } = useWindowDimensions()
  const isYoutube = item.mediaKind === 'youtube'
  const [ratio, setRatio] = useState<number | null>(isYoutube ? YOUTUBE_RATIO : null)
  const [playing, setPlaying] = useState(false)
  const videoId = isYoutube ? youtubeVideoId(item.youtubeUrl) : null

  // Un solo reproductor montado en todo el feed: el del item visible (PLAN H2).
  useEffect(() => {
    if (!active) setPlaying(false)
  }, [active])

  const box = ratio ? fitInside(ratio, width, height) : null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {item.mediaUrl ? (
        <>
          <Image
            source={item.mediaUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={BACKDROP_BLUR}
            recyclingKey={`${item.key}-bg`}
            onLoad={(e) => {
              if (!isYoutube && e.source.width > 0 && e.source.height > 0) setRatio(e.source.width / e.source.height)
            }}
          />
          {box && (
            <Image
              source={item.mediaUrl}
              style={[styles.centered, { width: box.width, height: box.height, left: (width - box.width) / 2, top: (height - box.height) / 2 }]}
              contentFit={isYoutube ? 'cover' : 'fill'}
              recyclingKey={item.key}
              transition={150}
              accessibilityIgnoresInvertColors
            />
          )}
        </>
      ) : (
        <LinearGradient colors={F.fallback} style={StyleSheet.absoluteFill} />
      )}

      <LinearGradient colors={F.shade} locations={F.shadeStops} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {videoId && playing && active && (
        <View style={styles.playerWrap}>
          <YoutubePlayer
            height={width / YOUTUBE_RATIO}
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
  centered: { position: 'absolute' },
  playerWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  playWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // El triángulo de "play" se ve corrido a la izquierda si se centra por caja.
  playIcon: { marginLeft: 4 },
})
