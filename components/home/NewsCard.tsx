import { TouchableOpacity, Image, View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
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

export function NewsCard({ article, onPress }: Props) {
  const C = useColors()
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: C.surface, borderColor: C.border }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={{ uri: article.imageUrl }} style={styles.thumb} resizeMode="cover" />
      <View style={styles.content}>
        <Badge variant={article.category}>{categoryLabel(article.category)}</Badge>
        <Text variant="body" weight="medium" numberOfLines={2} style={styles.title}>
          {article.title}
        </Text>
        <View style={styles.meta}>
          <Text variant="caption" style={{ color: C.muted }}>{article.source}</Text>
          <Text variant="caption" style={{ color: C.muted }}> · {timeAgo(article.publishedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.base,
    overflow: 'hidden',
    borderWidth: 1,
    minHeight: 112,
  },
  thumb: { width: 108, alignSelf: 'stretch' },
  content: { flex: 1, padding: Spacing[3], justifyContent: 'center', gap: Spacing[1.5] },
  title: { lineHeight: 21 },
  meta: { flexDirection: 'row', marginTop: Spacing[1] },
})
