import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { ContentRow } from '@/components/v2/ContentRow'
import { EXPLORE_TEXT } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'
import type { ExploreStatus } from '@/lib/feed-v2/use-explore'

interface Props {
  title: string
  items: FeedContentItem[]
  status: ExploreStatus
  onOpen: (item: FeedContentItem) => void
  onClear: () => void
  onRetry: () => void
  /** Si se eligió una categoría y está vacía: invita a pedir que carguemos contenido. */
  emptyCategory?: string | null
}

export function ExploreResults({ title, items, status, onOpen, onClear, onRetry, emptyCategory }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} numberOfLines={1} style={styles.title}>
          {title.toUpperCase()}
        </Text>
        <TouchableOpacity onPress={onClear} hitSlop={8} accessibilityRole="button" style={styles.clear}>
          <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.limeText}>{EXPLORE_TEXT.clear}</Text>
        </TouchableOpacity>
      </View>
      {status === 'loading' && items.length === 0 ? (
        <ActivityIndicator color={Colors.v2.limeText} style={styles.loading} />
      ) : status === 'error' ? (
        <TouchableOpacity onPress={onRetry} style={styles.message} accessibilityRole="button">
          <Text family="noto-sans" size={15} color={Colors.v2.muted} style={styles.center}>{EXPLORE_TEXT.error}</Text>
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.limeText}>{EXPLORE_TEXT.retry}</Text>
        </TouchableOpacity>
      ) : items.length === 0 && emptyCategory ? (
        <View style={styles.message}>
          <Ionicons name="add-circle-outline" size={32} color={Colors.v2.limeText} />
          <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.navy} style={styles.center}>{EXPLORE_TEXT.emptyCategory(emptyCategory)}</Text>
          <Text family="noto-sans" size={14} lineHeight={20} color={Colors.v2.muted} style={styles.center}>{EXPLORE_TEXT.emptyCategoryBody}</Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(main)/contacto', params: { motivo: 'publicar', mensaje: EXPLORE_TEXT.requestMessage(emptyCategory) } } as never)}
            accessibilityRole="button"
            style={styles.request}
          >
            <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.white}>{EXPLORE_TEXT.requestCta}</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.message}>
          <Text family="noto-sans" size={15} color={Colors.v2.muted} style={styles.center}>{EXPLORE_TEXT.noResults}</Text>
        </View>
      ) : (
        items.map((item) => <ContentRow key={item.key} item={item} onPress={() => onOpen(item)} />)
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, letterSpacing: 1 },
  clear: { minHeight: V2Layout.minTouch, justifyContent: 'center' },
  loading: { marginVertical: 24 },
  message: { backgroundColor: Colors.v2.surface, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  center: { textAlign: 'center' },
  request: { marginTop: 6, height: 46, paddingHorizontal: 20, borderRadius: 23, backgroundColor: Colors.v2.navy, justifyContent: 'center' },
})
