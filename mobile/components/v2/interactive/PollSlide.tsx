import { memo, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/Text'
import { InteractiveFrame } from '@/components/v2/interactive/InteractiveFrame'
import { Colors } from '@/constants/colors'
import { POINTS_TEXT, POLL_TEXT } from '@/lib/feed-v2/labels'
import { votePoll, type PollVoteResult } from '@/lib/feed-v2/points'
import { showToast } from '@/lib/feed-v2/toast'
import type { FeedPollItem } from '@/lib/feed-v2/types'

const I = Colors.v2.interactive

function Bar({ pct }: { pct: number }) {
  // Barra verde que crece hasta el porcentaje al votar (cubic suave, como el prototipo).
  const width = useSharedValue(0)
  useEffect(() => {
    width.value = withTiming(pct, { duration: 500 })
  }, [pct, width])
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` }))
  return <Animated.View style={[styles.bar, style]} />
}

function PollSlideBase({ item, height }: { item: FeedPollItem; height: number }) {
  const [result, setResult] = useState<PollVoteResult | null>(null)
  const [sending, setSending] = useState(false)

  async function vote(optionId: string) {
    if (result || sending) return
    setSending(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null)
    const r = await votePoll(item.id, optionId)
    setSending(false)
    if (!r) return showToast(POLL_TEXT.error)
    setResult(r)
    if (r.awarded > 0) showToast(POINTS_TEXT.toastEarned(r.awarded))
  }

  const total = result ? Object.values(result.results).reduce((a, b) => a + b, 0) : 0
  const pct = (id: string) => (result && total > 0 ? Math.round(((result.results[id] ?? 0) / total) * 100) : 0)

  return (
    <InteractiveFrame
      height={height}
      eyebrow={POLL_TEXT.label}
      badge={result && result.awarded > 0 ? POINTS_TEXT.earned(result.awarded) : POINTS_TEXT.plus(item.points)}
      badgeActive={!!result && result.awarded > 0}
    >
      <Text family="noto-sans" weight="extrabold" size={24} lineHeight={28} color={Colors.v2.navy} style={styles.q}>
        {item.question}
      </Text>
      <View style={styles.options}>
        {item.options.map((o) => {
          const mine = result?.myVote === o.id
          return (
            <TouchableOpacity
              key={o.id}
              onPress={() => vote(o.id)}
              disabled={!!result || sending}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: mine }}
              style={[styles.option, mine && styles.optionMine]}
            >
              {result && <Bar pct={pct(o.id)} />}
              <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy} style={styles.label} numberOfLines={2}>
                {o.label}
              </Text>
              {result && <Text family="noto-sans" weight="extrabold" size={14} color={Colors.v2.navy}>{pct(o.id)}%</Text>}
            </TouchableOpacity>
          )
        })}
      </View>
      <Text family="noto-sans" size={13} color={Colors.v2.muted}>
        {result ? POLL_TEXT.votes(total) : POLL_TEXT.tapToVote}
      </Text>
    </InteractiveFrame>
  )
}

export const PollSlide = memo(PollSlideBase)

const styles = StyleSheet.create({
  q: { letterSpacing: -0.4 },
  options: { gap: 8 },
  option: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: I.optionBorder,
    backgroundColor: I.optionBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    overflow: 'hidden',
  },
  optionMine: { borderColor: I.okBorder },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: I.bar },
  label: { flex: 1 },
})
