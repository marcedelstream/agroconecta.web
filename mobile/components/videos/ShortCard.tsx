import { useState } from 'react'
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import YoutubePlayer from 'react-native-youtube-iframe'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import type { ShortVideo } from '@/lib/shorts'

const R = Colors.redesign
const CARD_WIDTH = 128
const PLAYER_HEIGHT = 220

export function ShortCard({ id, title, thumbnail }: ShortVideo) {
  const [playing, setPlaying] = useState(false)

  return (
    <View style={styles.wrap}>
      <View style={styles.frame}>
        {playing ? (
          <YoutubePlayer height={PLAYER_HEIGHT} videoId={id} play />
        ) : (
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={0.9} onPress={() => setPlaying(true)}>
            <Image source={{ uri: thumbnail }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.overlay} />
            <View style={styles.playBtn}>
              <Ionicons name="play" size={15} color="#101014" />
            </View>
          </TouchableOpacity>
        )}
      </View>
      <Text family="noto-sans" weight="medium" size={11.5} lineHeight={15} color={R.foreground} numberOfLines={2} style={styles.title}>
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: CARD_WIDTH },
  frame: { width: CARD_WIDTH, height: PLAYER_HEIGHT, borderRadius: 14, overflow: 'hidden', backgroundColor: R.secondary },
  thumb: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  playBtn: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -15,
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 8 },
})
