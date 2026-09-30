import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { HOME_TEXT, TYPE_LABEL } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'

const CARD_WIDTH = 236

function when(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const s = d.toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface Props {
  title: string
  items: FeedContentItem[]
  onOpen: (item: FeedContentItem) => void
  onSeeAll?: () => void
  side: number
}

// Bloque horizontal del Inicio (Noticias para vos, Agenda del sector…), como las bandas de la v1: título,
// "Ver todo" y tarjetas que se deslizan de costado. Abren la misma ficha que el feed.
export function HomeBlock({ title, items, onOpen, onSeeAll, side }: Props) {
  if (items.length === 0) return null
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text family="noto-sans" weight="extrabold" size={20} color={Colors.v2.navy} style={styles.flex}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} hitSlop={8} accessibilityRole="button">
            <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.limeText}>{HOME_TEXT.seeAll}</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -side }} contentContainerStyle={[styles.row, { paddingHorizontal: side }]}>
        {items.map((item) => {
          const date = item.contentType === 'evento' || item.contentType === 'remate' ? when(item.startsAt) : null
          return (
            <TouchableOpacity key={item.key} onPress={() => onOpen(item)} activeOpacity={0.88} accessibilityRole="button" style={styles.card}>
              {item.mediaUrl ? (
                <Image source={item.mediaUrl} style={styles.image} contentFit="cover" recyclingKey={`${item.key}-home`} />
              ) : (
                <View style={[styles.image, styles.imageEmpty]} />
              )}
              <View style={styles.body}>
                <Text family="noto-sans" weight="bold" size={11} color={Colors.v2.limeText} style={styles.type}>{TYPE_LABEL[item.contentType]}</Text>
                <Text family="noto-sans" weight="bold" size={15} lineHeight={19} color={Colors.v2.navy} numberOfLines={3}>{item.title}</Text>
                <Text family="noto-sans" size={12} color={Colors.v2.muted} numberOfLines={1}>{date ?? item.organizationName}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  row: { gap: 12 },
  card: { width: CARD_WIDTH, borderRadius: 20, backgroundColor: Colors.v2.surface, overflow: 'hidden' },
  image: { width: CARD_WIDTH, height: 132 },
  imageEmpty: { backgroundColor: Colors.v2.navy },
  body: { padding: 12, gap: 4, minHeight: 104 },
  type: { letterSpacing: 0.9 },
})
