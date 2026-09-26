import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { EXPLORE_TEXT } from '@/lib/feed-v2/labels'
import type { TrendingTag } from '@/lib/feed-v2/types'

interface Props {
  trending: TrendingTag[]
  onPick: (tag: string) => void
}

// Top 4 etiquetas de las últimas 2 semanas (las calcula /api/explore). Tocar una la busca.
export function TrendingList({ trending, onPick }: Props) {
  return (
    <View style={styles.card}>
      {trending.map((t, i) => (
        <TouchableOpacity key={t.tag} onPress={() => onPick(t.tag)} activeOpacity={0.7} accessibilityRole="button" style={styles.row}>
          <Text family="noto-sans" weight="extrabold" size={20} color={Colors.v2.lime} style={styles.rank}>
            {i + 1}
          </Text>
          <View style={styles.texts}>
            <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.navy}>
              #{t.tag.replace(/-/g, '')}
            </Text>
            <Text family="noto-sans" size={13} color={Colors.v2.muted}>
              {EXPLORE_TEXT.posts(t.count)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.v2.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.v2.light.cardBorder, padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 14 },
  rank: { width: 28 },
  texts: { flex: 1, gap: 2 },
})
