import { StyleSheet, TouchableOpacity, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { POINTS_TEXT, REWARDS_TEXT } from '@/lib/feed-v2/labels'
import type { PointsMovement } from '@/lib/feed-v2/points'
import type { Redemption, Reward } from '@/lib/feed-v2/rewards'
import { showToast } from '@/lib/feed-v2/toast'

const F = Colors.v2.feed
const L = Colors.v2.light

/** Saldo grande sobre fondo oscuro + barra de progreso hacia el próximo premio. */
export function BalanceHeader({ balance, rewards }: { balance: number; rewards: Reward[] }) {
  const next = rewards.filter((r) => r.cost > balance).sort((a, b) => a.cost - b.cost)[0]
  const progress = next ? Math.min(1, balance / next.cost) : 1
  return (
    <View style={styles.balance}>
      <Text family="noto-sans" weight="semibold" size={13} color={F.textMuted}>{REWARDS_TEXT.balance}</Text>
      <Text family="noto-sans" weight="extrabold" size={44} lineHeight={48} color={Colors.v2.white}>{POINTS_TEXT.pts(balance)}</Text>
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} /></View>
      <Text family="noto-sans" size={13} color={F.textSoft}>
        {next ? REWARDS_TEXT.nextGoal(next.cost - balance, next.title) : REWARDS_TEXT.allUnlocked}
      </Text>
    </View>
  )
}

export function RewardCard({ reward, balance, busy, onRedeem }: { reward: Reward; balance: number; busy: boolean; onRedeem: () => void }) {
  const soldOut = reward.stock !== null && reward.stock <= 0
  const can = !soldOut && balance >= reward.cost
  const cta = soldOut ? REWARDS_TEXT.outOfStock : can ? REWARDS_TEXT.redeem : REWARDS_TEXT.missing(reward.cost - balance)
  return (
    <View style={styles.card}>
      <View style={styles.flex}>
        <Text family="noto-sans" weight="bold" size={11} color={Colors.v2.limeText} style={styles.eyebrow}>{REWARDS_TEXT.kind[reward.kind]}</Text>
        <Text family="noto-sans" weight="bold" size={16} lineHeight={20} color={Colors.v2.navy}>{reward.title}</Text>
        {reward.partnerName ? <Text family="noto-sans" size={13} color={Colors.v2.muted}>{reward.partnerName}</Text> : null}
      </View>
      <TouchableOpacity
        onPress={onRedeem}
        disabled={!can || busy}
        accessibilityRole="button"
        accessibilityState={{ disabled: !can || busy }}
        style={[styles.redeem, can ? styles.redeemOn : styles.redeemOff]}
      >
        <Text family="noto-sans" weight="extrabold" size={13} color={can ? Colors.v2.white : Colors.v2.navy}>{POINTS_TEXT.pts(reward.cost)}</Text>
        <Text family="noto-sans" weight="semibold" size={11} color={can ? Colors.v2.white : Colors.v2.muted}>{cta}</Text>
      </TouchableOpacity>
    </View>
  )
}

export function RedemptionRow({ r }: { r: Redemption }) {
  async function copy() {
    await Clipboard.setStringAsync(r.code)
    showToast(REWARDS_TEXT.copied)
  }
  return (
    <View style={styles.card}>
      <View style={styles.flex}>
        <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy}>{r.rewardTitle}</Text>
        <Text family="noto-sans" size={12} color={Colors.v2.muted}>{REWARDS_TEXT.status[r.status]}</Text>
      </View>
      <TouchableOpacity onPress={copy} accessibilityRole="button" accessibilityLabel={REWARDS_TEXT.copy} style={styles.code}>
        <Text family="noto-sans" weight="extrabold" size={15} color={Colors.v2.navy} style={styles.mono}>{r.code}</Text>
        <Ionicons name="copy-outline" size={16} color={Colors.v2.muted} />
      </TouchableOpacity>
    </View>
  )
}

export function HistoryList({ history }: { history: PointsMovement[] }) {
  return (
    <View style={styles.historyCard}>
      {history.map((h, i) => (
        <View key={`${h.created_at}-${i}`} style={[styles.historyRow, i < history.length - 1 && styles.divider]}>
          <Text family="noto-sans" size={14} color={Colors.v2.sheet.body} style={styles.flex} numberOfLines={1}>{h.description}</Text>
          <Text family="noto-sans" weight="extrabold" size={14} color={h.delta >= 0 ? L.upText : L.downText}>
            {h.delta >= 0 ? `+${h.delta}` : `${h.delta}`}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  balance: { backgroundColor: Colors.v2.navy, borderRadius: 24, padding: 22, gap: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: F.progressTrack, overflow: 'hidden', marginTop: 4 },
  fill: { height: 8, borderRadius: 4, backgroundColor: Colors.v2.lime },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: Colors.v2.surface },
  eyebrow: { letterSpacing: 0.9 },
  redeem: { minWidth: 84, height: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  redeemOn: { backgroundColor: Colors.v2.navy, borderColor: Colors.v2.navy },
  redeemOff: { backgroundColor: Colors.v2.surface, borderColor: Colors.v2.sheet.border },
  code: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.v2.limeTint },
  mono: { letterSpacing: 1.5 },
  historyCard: { backgroundColor: Colors.v2.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: L.inputBorder },
})
