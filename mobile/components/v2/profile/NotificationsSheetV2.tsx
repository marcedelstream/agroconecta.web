import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { V2Sheet } from '@/components/v2/V2Sheet'
import { ReminderSwitch } from '@/components/v2/ReminderSwitch'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { NOTIF_TEXT as T } from '@/lib/feed-v2/labels'
import type { NotificationPreferences } from '@/lib/types'

type IconName = React.ComponentProps<typeof Ionicons>['name']

const ROWS: { key: keyof NotificationPreferences; icon: IconName }[] = [
  { key: 'breakingNews', icon: 'flash-outline' },
  { key: 'priceAlerts', icon: 'trending-up-outline' },
  { key: 'weatherAlerts', icon: 'partly-sunny-outline' },
  { key: 'institutionalUpdates', icon: 'business-outline' },
]

const DEFAULT_PREFS: NotificationPreferences = { breakingNews: true, priceAlerts: true, weatherAlerts: true, institutionalUpdates: false }

// Categorías de notificación (profiles.notification_prefs, las usa el envío del servidor para filtrar).
export function NotificationsSheetV2({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useApp()
  const prefs = user?.notificationPrefs ?? DEFAULT_PREFS

  return (
    <V2Sheet title={T.title} subtitle={T.subtitle} onClose={onClose}>
      <View style={styles.card}>
        {ROWS.map((r, i) => (
          <View key={r.key} style={[styles.row, i < ROWS.length - 1 && styles.divider]}>
            <View style={styles.icon}>
              <Ionicons name={r.icon} size={18} color={Colors.v2.limeText} />
            </View>
            <View style={styles.flex}>
              <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy}>{T.rows[r.key].label}</Text>
              <Text family="noto-sans" size={13} color={Colors.v2.muted}>{T.rows[r.key].hint}</Text>
            </View>
            <ReminderSwitch
              value={prefs[r.key]}
              onChange={(v) => void updateUser({ notificationPrefs: { ...prefs, [r.key]: v } })}
              accessibilityLabel={T.rows[r.key].label}
            />
          </View>
        ))}
      </View>
      <Text family="noto-sans" size={13} lineHeight={18} color={Colors.v2.muted}>{T.reminders}</Text>
    </V2Sheet>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 20, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.v2.light.inputBorder },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.v2.limeTint, alignItems: 'center', justifyContent: 'center' },
})
