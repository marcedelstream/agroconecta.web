import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActionRail } from '@/components/v2/feed/ActionRail'
import { ContentCTA } from '@/components/v2/feed/ContentCTA'
import { DoubleTapLike } from '@/components/v2/feed/DoubleTapLike'
import { FeedBackground } from '@/components/v2/feed/FeedBackground'
import { FeedInfo } from '@/components/v2/feed/FeedInfo'
import { useFeedInsets } from '@/components/v2/feed/layout'
import { Colors } from '@/constants/colors'
import { openPublisher } from '@/lib/feed-v2/navigation'
import type { FeedContentItem } from '@/lib/feed-v2/types'
import type { FeedActions } from '@/lib/feed-v2/use-feed'

interface Props {
  item: FeedContentItem
  height: number
  active: boolean
  actions: FeedActions
}

// Un contenido a pantalla completa: fondo + degradado, info abajo a la izquierda, barra lateral
// y el botón de acción. La cabecera (logo + buscar) va fija sobre el pager, no acá.
function FeedContentSlideBase({ item, height, active, actions }: Props) {
  const { ctaBottom, contentBottom, side } = useFeedInsets()
  return (
    <View style={[styles.slide, { height }]}>
      <DoubleTapLike onDoubleTap={() => actions.likeOnce(item)}>
        <FeedBackground item={item} active={active} height={height} />
      </DoubleTapLike>
      <FeedInfo item={item} bottom={contentBottom} side={side} />
      <ActionRail
        item={item}
        bottom={contentBottom}
        onLike={() => actions.toggleLike(item)}
        onSave={() => actions.toggleSave(item)}
        onShare={() => actions.share(item)}
        onFollow={() => actions.toggleFollow(item)}
        onOpenPublisher={() => openPublisher(item)}
      />
      <ContentCTA type={item.contentType} bottom={ctaBottom} side={side} onPress={() => actions.openDetail(item)} />
    </View>
  )
}

export const FeedContentSlide = memo(FeedContentSlideBase)

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden', backgroundColor: Colors.v2.navy },
})
