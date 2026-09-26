import { useCallback, useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { BalanceHeader, HistoryList, RedemptionRow, RewardCard } from '@/components/v2/rewards/RewardsParts'
import { ToastHost } from '@/components/v2/ToastHost'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { REWARDS_TEXT } from '@/lib/feed-v2/labels'
import { usePoints } from '@/lib/feed-v2/points'
import { fetchMyRedemptions, fetchRewards, redeemReward, type Redemption, type Reward } from '@/lib/feed-v2/rewards'
import { showToast } from '@/lib/feed-v2/toast'
import { goBack } from '@/lib/navigation'

const Section = ({ title }: { title: string }) => (
  <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} style={styles.section}>{title}</Text>
)
const Empty = ({ text }: { text: string }) => (
  <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.muted} style={styles.empty}>{text}</Text>
)

// Canjear puntos (README §3.7): saldo, progreso, catálogo, mis canjes con código, cómo sumar e historial.
export default function CanjesScreen() {
  const insets = useSafeAreaInsets()
  const { balance, history, refresh } = usePoints()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [mine, setMine] = useState<Redemption[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchRewards().then(setRewards).catch(() => null)
    fetchMyRedemptions().then(setMine).catch(() => null)
    refresh()
  }, [refresh])
  useFocusEffect(load)

  function confirm(r: Reward) {
    Alert.alert(REWARDS_TEXT.confirmTitle, REWARDS_TEXT.confirmBody(r.title, r.cost), [
      { text: REWARDS_TEXT.cancel, style: 'cancel' },
      { text: REWARDS_TEXT.confirm, onPress: () => void redeem(r) },
    ])
  }

  async function redeem(r: Reward) {
    setBusy(r.id)
    const result = await redeemReward(r.id)
    setBusy(null)
    if (result.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null)
      showToast(REWARDS_TEXT.done(result.code))
      load()
    } else showToast(REWARDS_TEXT.errors[result.error])
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.bar}>
          <TouchableOpacity onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={REWARDS_TEXT.back} style={styles.back}>
            <Ionicons name="chevron-back" size={20} color={Colors.v2.navy} />
          </TouchableOpacity>
          <Text family="noto-sans" weight="extrabold" size={26} color={Colors.v2.navy}>{REWARDS_TEXT.title}</Text>
        </View>

        <BalanceHeader balance={balance} rewards={rewards} />

        <Section title={REWARDS_TEXT.catalog} />
        {rewards.length === 0 ? <Empty text={REWARDS_TEXT.emptyCatalog} /> : rewards.map((r) => (
          <RewardCard key={r.id} reward={r} balance={balance} busy={busy === r.id} onRedeem={() => confirm(r)} />
        ))}

        <Section title={REWARDS_TEXT.mine} />
        {mine.length === 0 ? <Empty text={REWARDS_TEXT.emptyMine} /> : mine.map((m) => <RedemptionRow key={m.id} r={m} />)}

        <Section title={REWARDS_TEXT.howTo} />
        <View style={styles.ways}>
          {REWARDS_TEXT.ways.map((w) => (
            <View key={w} style={styles.way}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.v2.limeText} />
              <Text family="noto-sans" size={15} color={Colors.v2.navy} style={styles.flex}>{w}</Text>
            </View>
          ))}
        </View>

        <Section title={REWARDS_TEXT.history} />
        {history.length === 0 ? <Empty text={REWARDS_TEXT.emptyHistory} /> : <HistoryList history={history} />}
      </ScrollView>
      <ToastHost />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingHorizontal: 18, gap: 12 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  back: {
    width: V2Layout.minTouch,
    height: V2Layout.minTouch,
    borderRadius: V2Layout.minTouch / 2,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { letterSpacing: 1, marginTop: 12 },
  empty: { paddingVertical: 4 },
  ways: { backgroundColor: Colors.v2.surface, borderRadius: 20, padding: 16, gap: 12 },
  way: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
})
