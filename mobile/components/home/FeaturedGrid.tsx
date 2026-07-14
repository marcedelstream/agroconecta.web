import { useState } from 'react'
import { View, FlatList, TouchableOpacity, Image, useWindowDimensions, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import type { NewsArticle } from '@/lib/types'

const CARD_HEIGHT = 240
const CARD_GAP = Spacing[3]

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

interface Props {
  posts: NewsArticle[]
  onPress: (id: string) => void
}

export function FeaturedGrid({ posts, onPress }: Props) {
  const C = useColors()
  const { width } = useWindowDimensions()
  const cardWidth = width - Spacing[5] * 2
  const [index, setIndex] = useState(0)

  if (posts.length === 0) return null

  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        horizontal
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEnabled={posts.length > 1}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP)))
        }}
        getItemLayout={(_, i) => ({ length: cardWidth, offset: (cardWidth + CARD_GAP) * i, index: i })}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, height: CARD_HEIGHT }]}
            activeOpacity={0.9}
            onPress={() => onPress(item.id)}
          >
            <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <View style={styles.overlay}>
              <Badge variant={item.category}>{categoryLabel(item.category)}</Badge>
              <Text variant="subtitle" weight="bold" family="poppins" style={styles.title} numberOfLines={3}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {posts.length > 1 && (
        <View style={styles.dots}>
          {posts.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === index ? Colors.lime : C.border }]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, overflow: 'hidden' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing[4],
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: Spacing[2],
  },
  title: { color: '#FFF' },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[1.5],
    marginTop: Spacing[3],
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
})
