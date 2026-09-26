import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { FollowAvatar } from '@/components/v2/feed/FollowAvatar'
import { GlassCircle } from '@/components/v2/feed/GlassCircle'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { canFollow } from '@/lib/feed-v2/actions'
import { FEED_TEXT, formatCount } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'

const F = Colors.v2.feed

interface Props {
  item: FeedContentItem
  bottom: number
  onLike: () => void
  onSave: () => void
  onShare: () => void
  onFollow: () => void
  onOpenPublisher: () => void
}

function RailButton({ label, a11y, selected, onPress, children }: {
  label: string
  a11y: string
  selected?: boolean
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <View style={styles.btn}>
      <GlassCircle size={V2Layout.railButton} onPress={onPress} accessibilityLabel={a11y} selected={selected}>
        {children}
      </GlassCircle>
      <Text family="noto-sans" weight="semibold" size={12} lineHeight={15} color={Colors.v2.white} style={styles.count}>
        {label}
      </Text>
    </View>
  )
}

// Barra lateral derecha (README §3.1): seguir, me gusta, guardar, compartir. Sin comentarios.
export function ActionRail({ item, bottom, onLike, onSave, onShare, onFollow, onOpenPublisher }: Props) {
  const white = Colors.v2.white
  return (
    <View style={[styles.rail, { bottom }]}>
      <FollowAvatar
        name={item.organizationName}
        logoUrl={item.organizationLogoUrl}
        following={item.following}
        onToggleFollow={canFollow(item) ? onFollow : null}
        onPress={onOpenPublisher}
      />
      <RailButton label={formatCount(item.likes)} a11y={FEED_TEXT.like} selected={item.liked} onPress={onLike}>
        <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={24} color={item.liked ? F.heart : white} />
      </RailButton>
      <RailButton label={item.saved ? FEED_TEXT.saved : FEED_TEXT.save} a11y={FEED_TEXT.save} selected={item.saved} onPress={onSave}>
        <Ionicons name={item.saved ? 'bookmark' : 'bookmark-outline'} size={22} color={item.saved ? Colors.v2.lime : white} />
      </RailButton>
      <RailButton label={FEED_TEXT.share} a11y={FEED_TEXT.shareA11y} onPress={onShare}>
        <Ionicons name="paper-plane-outline" size={22} color={white} />
      </RailButton>
    </View>
  )
}

const styles = StyleSheet.create({
  rail: { position: 'absolute', right: 12, alignItems: 'center', gap: 16 },
  btn: { alignItems: 'center', gap: 4 },
  count: { textShadowColor: F.textShadow, textShadowRadius: 3, textShadowOffset: { width: 0, height: 1 } },
})
