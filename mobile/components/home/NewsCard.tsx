import { TouchableOpacity, Image, View, StyleSheet, Share } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
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

export function NewsCard({ article, onPress }: Props) {
  const C = useColors()

  async function handleShare() {
    await Share.share({
      message: `${article.title}\n\nLeé más en Agroconecta: https://agroconecta.com.py/noticias/${article.slug ?? article.id}`,
    })
  }

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
        <View style={styles.footer}>
          <View style={styles.meta}>
            {article.organizationLogoUrl && (
              <Image source={{ uri: article.organizationLogoUrl }} style={styles.sourceLogo} />
            )}
            <Text variant="caption" style={{ color: C.muted }}>{article.source}</Text>
            <Text variant="caption" style={{ color: C.muted }}> · {timeAgo(article.publishedAt)}</Text>
          </View>
          <TouchableOpacity onPress={handleShare} hitSlop={8} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={16} color={C.muted} />
          </TouchableOpacity>
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
  content: { flex: 1, padding: Spacing[3], justifyContent: 'space-between', gap: Spacing[1.5] },
  title: { lineHeight: 21, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  sourceLogo: { width: 14, height: 14, borderRadius: 4, marginRight: Spacing[1] },
  shareBtn: { paddingLeft: Spacing[2] },
})
