import { TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import type { LibraryItem } from '@/lib/types'

interface Props {
  item: LibraryItem
  onPress: () => void
}

export function BookCard({ item, onPress }: Props) {
  const C = useColors()
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: item.coverImageUrl }} style={[styles.cover, { backgroundColor: C.secondary }]} resizeMode="cover" />
      <Text variant="caption" weight="semibold" numberOfLines={2} style={{ color: C.foreground, marginTop: Spacing[1.5] }}>
        {item.title}
      </Text>
      {item.author && (
        <Text variant="label" style={{ color: C.muted }} numberOfLines={1}>{item.author}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { width: 120 },
  cover: { width: 120, height: 168, borderRadius: Radius.md },
})
