import { View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Radius, Spacing } from '@/constants/spacing'
import type { NewsArticle } from '@/lib/types'

const GRID_HEIGHT = 240

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function SmallCard({ article, onPress }: { article: NewsArticle; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.smallCard} activeOpacity={0.88} onPress={onPress}>
      <Image source={{ uri: article.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <View style={styles.smallOverlay}>
        <Text style={styles.smallTitle} numberOfLines={2}>{article.title}</Text>
      </View>
    </TouchableOpacity>
  )
}

interface Props {
  posts: NewsArticle[]
  onPress: (id: string) => void
}

export function FeaturedGrid({ posts, onPress }: Props) {
  const [main, second, third] = posts
  if (!main) return null

  if (!second) {
    return (
      <TouchableOpacity style={[styles.mainCard, { height: GRID_HEIGHT }]} activeOpacity={0.9} onPress={() => onPress(main.id)}>
        <Image source={{ uri: main.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={styles.mainOverlay}>
          <Badge variant={main.category}>{categoryLabel(main.category)}</Badge>
          <Text variant="subtitle" weight="bold" family="poppins" style={styles.mainTitle} numberOfLines={3}>
            {main.title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.row, { height: GRID_HEIGHT }]}>
      <TouchableOpacity style={[styles.mainCard, styles.flex]} activeOpacity={0.9} onPress={() => onPress(main.id)}>
        <Image source={{ uri: main.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={styles.mainOverlay}>
          <Badge variant={main.category}>{categoryLabel(main.category)}</Badge>
          <Text variant="subtitle" weight="bold" family="poppins" style={styles.mainTitle} numberOfLines={3}>
            {main.title}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.sideColumn}>
        <SmallCard article={second} onPress={() => onPress(second.id)} />
        {third && <SmallCard article={third} onPress={() => onPress(third.id)} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing[2] },
  flex: { flex: 1 },
  mainCard: { borderRadius: Radius.xl, overflow: 'hidden' },
  mainOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing[3],
    backgroundColor: 'rgba(0,0,0,0.52)',
    gap: Spacing[1.5],
  },
  mainTitle: { color: '#FFF' },
  sideColumn: { width: 128, gap: Spacing[2] },
  smallCard: { flex: 1, borderRadius: Radius.base, overflow: 'hidden', backgroundColor: '#12121C' },
  smallOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing[2],
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  smallTitle: { fontSize: 11, fontWeight: '600', color: '#FFF', lineHeight: 15 },
})
