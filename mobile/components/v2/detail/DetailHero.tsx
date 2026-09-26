import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { DETAIL_TEXT } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'

export const HERO_HEIGHT = 250
const SHEET_RADIUS = 28

interface Props {
  item: FeedContentItem
  onClose: () => void
}

// Imagen de cabecera de la ficha + botón cerrar + la manija que indica que se puede bajar.
export function DetailHero({ item, onClose }: Props) {
  return (
    <View style={styles.hero}>
      {item.mediaUrl ? (
        <Image source={item.mediaUrl} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={`${item.key}-hero`} />
      ) : (
        <LinearGradient colors={Colors.v2.feed.fallback} style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.handle} />
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.8}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={DETAIL_TEXT.close}
        style={styles.close}
      >
        <Ionicons name="close" size={20} color={Colors.v2.white} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    backgroundColor: Colors.v2.navy,
  },
  handle: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.v2.sheet.handle,
  },
  close: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: V2Layout.minTouch,
    height: V2Layout.minTouch,
    borderRadius: V2Layout.minTouch / 2,
    backgroundColor: Colors.v2.sheet.closeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
