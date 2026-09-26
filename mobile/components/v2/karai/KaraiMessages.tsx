import { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { KARAI_TEXT, TYPE_LABEL } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'
import type { KaraiMessage } from '@/lib/feed-v2/use-karai'

const REF_THUMB = 44

function RefCard({ item, onOpen }: { item: FeedContentItem; onOpen: () => void }) {
  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.85} accessibilityRole="button" style={styles.ref}>
      {item.mediaUrl ? <Image source={item.mediaUrl} style={styles.refThumb} contentFit="cover" /> : <View style={[styles.refThumb, styles.refEmpty]} />}
      <View style={styles.flex}>
        <Text family="noto-sans" weight="bold" size={10} color={Colors.v2.limeText} style={styles.refType}>{TYPE_LABEL[item.contentType]}</Text>
        <Text family="noto-sans" weight="bold" size={14} lineHeight={18} color={Colors.v2.navy} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  )
}

export function KaraiBubble({ message, onOpenRef }: { message: KaraiMessage; onOpenRef: (item: FeedContentItem) => void }) {
  if (message.role === 'user') {
    return (
      <View style={[styles.bubble, styles.me]}>
        <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.white}>{message.text}</Text>
      </View>
    )
  }
  return (
    <View style={[styles.bubble, styles.bot]}>
      <Text family="noto-sans" size={15} lineHeight={22} color={Colors.v2.navy}>{message.text}</Text>
      {message.notice === 'members' && (
        <TouchableOpacity onPress={() => router.push('/(main)/sumate' as never)} accessibilityRole="button" style={styles.notice}>
          <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.navy}>{KARAI_TEXT.membersOnlyCta}</Text>
        </TouchableOpacity>
      )}
      {message.refs.map((r) => <RefCard key={r.key} item={r} onOpen={() => onOpenRef(r)} />)}
    </View>
  )
}

function Dot({ delay }: { delay: number }) {
  const o = useSharedValue(0.3)
  useEffect(() => {
    o.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 350 }), withTiming(0.3, { duration: 350 })), -1))
  }, [delay, o])
  const style = useAnimatedStyle(() => ({ opacity: o.value }))
  return <Animated.View style={[styles.dot, style]} />
}

export function TypingBubble() {
  return (
    <View style={[styles.bubble, styles.bot, styles.typing]} accessibilityLabel={KARAI_TEXT.typing}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  bubble: { paddingVertical: 11, paddingHorizontal: 15, gap: 10 },
  me: { alignSelf: 'flex-end', maxWidth: '78%', backgroundColor: Colors.v2.navy, borderRadius: 20, borderBottomRightRadius: 6 },
  bot: {
    alignSelf: 'flex-start',
    maxWidth: '86%',
    backgroundColor: Colors.v2.surface,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.v2.light.cardBorder,
  },
  typing: { flexDirection: 'row', gap: 5, paddingVertical: 16, paddingHorizontal: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.v2.muted },
  ref: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 14, borderWidth: 1, borderColor: Colors.v2.light.inputBorder, backgroundColor: Colors.v2.interactive.optionBg },
  refThumb: { width: REF_THUMB, height: REF_THUMB, borderRadius: 10 },
  refEmpty: { backgroundColor: Colors.v2.limeTint },
  refType: { letterSpacing: 0.8 },
  notice: { alignSelf: 'flex-start', height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: Colors.v2.lime, justifyContent: 'center' },
})
