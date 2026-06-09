import { TouchableOpacity, Image, View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Radius, Spacing } from '@/constants/spacing'
import type { NewsArticle } from '@/lib/types'

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'Hace menos de 1h'
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

interface Props {
  article: NewsArticle
  onPress: () => void
}

export function FeaturedCard({ article, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: article.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <Badge variant={article.category}>{categoryLabel(article.category)}</Badge>
        <Text variant="subtitle" weight="bold" family="poppins" style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>
        <View style={styles.meta}>
          <Text variant="caption" color="rgba(255,255,255,0.7)">{article.source}</Text>
          <Text variant="caption" color="rgba(255,255,255,0.7)"> · {timeAgo(article.publishedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { borderRadius: Radius.xl, overflow: 'hidden', height: 220 },
  image: { width: '100%', height: '100%', position: 'absolute' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing[4],
    backgroundColor: 'rgba(0,0,0,0.52)',
    gap: Spacing[2],
  },
  title: { color: '#FFFFFF' },
  meta: { flexDirection: 'row' },
})
