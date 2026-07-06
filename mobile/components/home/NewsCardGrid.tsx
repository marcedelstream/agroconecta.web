import { TouchableOpacity, Image, View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { useColors } from '@/lib/theme-context'
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

export function NewsCardGrid({ article, onPress }: Props) {
  const C = useColors()

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: C.surface, borderColor: C.border }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: article.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.badgeOverlay}>
          <Badge variant={article.category}>{categoryLabel(article.category)}</Badge>
        </View>
      </View>
      <View style={styles.content}>
        <Text variant="caption" weight="semibold" numberOfLines={2} style={styles.title}>
          {article.title}
        </Text>
        <Text variant="label" style={{ color: C.muted }} numberOfLines={1}>
          {article.source} · {timeAgo(article.publishedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexBasis: '48%',
    borderRadius: Radius.base,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageWrap: { width: '100%', aspectRatio: 1 },
  image: { width: '100%', height: '100%' },
  badgeOverlay: { position: 'absolute', top: Spacing[2], left: Spacing[2] },
  content: { padding: Spacing[2.5], gap: Spacing[1] },
  title: { lineHeight: 17 },
})
