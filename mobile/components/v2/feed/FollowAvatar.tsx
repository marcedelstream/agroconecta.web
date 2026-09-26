import { Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { FEED_TEXT } from '@/lib/feed-v2/labels'

const AVATAR = 52
const BADGE = 22

interface Props {
  name: string
  logoUrl: string | null
  following: boolean
  /** null = no se puede seguir (eventos externos, listings): se muestra solo el avatar. */
  onToggleFollow: (() => void) | null
  onPress: () => void
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function FollowAvatar({ name, logoUrl, following, onToggleFollow, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={name} style={styles.avatar}>
        {logoUrl ? (
          <Image source={logoUrl} style={styles.logo} contentFit="cover" />
        ) : (
          <Text family="noto-sans" weight="extrabold" size={16} color={Colors.v2.white}>
            {initials(name)}
          </Text>
        )}
      </Pressable>
      {onToggleFollow && (
        <Pressable
          onPress={onToggleFollow}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`${following ? FEED_TEXT.unfollow : FEED_TEXT.follow} ${name}`}
          style={[styles.badge, { backgroundColor: following ? Colors.v2.white : Colors.v2.lime }]}
        >
          <Ionicons name={following ? 'checkmark' : 'add'} size={14} color={Colors.v2.navy} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: AVATAR, height: AVATAR + 10, alignItems: 'center' },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    borderColor: Colors.v2.white,
    overflow: 'hidden',
    backgroundColor: Colors.v2.feed.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    bottom: 0,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
