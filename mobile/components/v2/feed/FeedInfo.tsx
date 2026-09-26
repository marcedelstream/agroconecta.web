import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { TypeChip } from '@/components/v2/feed/TypeChip'
import { Colors } from '@/constants/colors'
import { FEED_TEXT, TYPE_LABEL } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'

const F = Colors.v2.feed
// Deja lugar a la barra lateral (48 px + márgenes), como el `right: 84px` del prototipo.
const RAIL_GUTTER = 84
const MAX_TAGS = 3

interface Props {
  item: FeedContentItem
  bottom: number
  side: number
}

function formatTag(tag: string) {
  return `#${tag.replace(/-/g, '')}`
}

// Zona inferior izquierda: chip del tipo + organización, título, bajada y etiquetas.
export function FeedInfo({ item, bottom, side }: Props) {
  return (
    <View style={[styles.wrap, { bottom, left: side, right: RAIL_GUTTER }]} pointerEvents="none">
      <View style={styles.meta}>
        <TypeChip
          label={item.isLive ? FEED_TEXT.live : TYPE_LABEL[item.contentType]}
          dotColor={item.isLive ? Colors.v2.live : undefined}
        />
        <Text family="noto-sans" weight="semibold" size={14} color={F.textOrg} numberOfLines={1} style={styles.org}>
          {item.organizationName}
        </Text>
      </View>
      <Text family="noto-sans" weight="extrabold" size={26} lineHeight={30} color={Colors.v2.white} numberOfLines={4} style={styles.title}>
        {item.title}
      </Text>
      {item.summary.length > 0 && (
        <Text family="noto-sans" size={15} lineHeight={21} color={F.textSoft} numberOfLines={3}>
          {item.summary}
        </Text>
      )}
      {item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.slice(0, MAX_TAGS).map((tag) => (
            <Text key={tag} family="noto-sans" weight="semibold" size={14} color={F.tag}>
              {formatTag(tag)}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', gap: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  org: { flexShrink: 1 },
  title: { letterSpacing: -0.5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
})
