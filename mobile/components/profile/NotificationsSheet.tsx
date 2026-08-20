import { View, StyleSheet } from 'react-native'
import { SettingsSheet } from './SettingsSheet'
import { Text } from '@/components/ui/Text'
import { AnimatedToggle } from '@/components/ui/AnimatedToggle'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useApp } from '@/lib/app-context'
import type { NotificationPreferences } from '@/lib/types'

type IconName = React.ComponentProps<typeof Ionicons>['name']

const rows: { key: keyof NotificationPreferences; label: string; icon: IconName }[] = [
  { key: 'breakingNews',         label: 'Noticias de último momento', icon: 'flash-outline' },
  { key: 'priceAlerts',          label: 'Alertas de precios',         icon: 'trending-up-outline' },
  { key: 'weatherAlerts',        label: 'Alertas climáticas',         icon: 'cloudy-outline' },
  { key: 'institutionalUpdates', label: 'Avisos institucionales',     icon: 'business-outline' },
]

const DEFAULT_PREFS: NotificationPreferences = {
  breakingNews: true, priceAlerts: true, weatherAlerts: true, institutionalUpdates: false,
}

interface Props { onClose: () => void }

export function NotificationsSheet({ onClose }: Props) {
  const C = useColors()
  const { user, updateUser } = useApp()
  const prefs = user?.notificationPrefs ?? DEFAULT_PREFS

  async function toggle(key: keyof NotificationPreferences) {
    await updateUser({ notificationPrefs: { ...prefs, [key]: !prefs[key] } })
  }

  return (
    <SettingsSheet title="Notificaciones" onClose={onClose} heightRatio={0.58}>
      <View style={styles.content}>
        <View style={[styles.infoBox, { backgroundColor: `${Colors.lime}12`, borderColor: `${Colors.lime}30` }]}>
          <Ionicons name="notifications" size={16} color={Colors.lime} />
          <Text variant="caption" style={{ color: C.muted, flex: 1 }}>
            Las notificaciones se envían a este dispositivo. Podés activar o pausar cada tipo.
          </Text>
        </View>
        {rows.map((row, idx) => (
          <View key={row.key} style={[styles.row, { borderBottomColor: C.border }, idx === rows.length - 1 && styles.rowLast]}>
            <View style={[styles.iconBox, { backgroundColor: `${Colors.lime}15` }]}>
              <Ionicons name={row.icon} size={18} color={Colors.lime} />
            </View>
            <Text variant="body" weight="medium" style={{ flex: 1, color: C.foreground }}>{row.label}</Text>
            <AnimatedToggle value={prefs[row.key]} onValueChange={() => toggle(row.key)} />
          </View>
        ))}
      </View>
    </SettingsSheet>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing[5], gap: Spacing[3] },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2], padding: Spacing[3], borderRadius: Radius.base, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[3], borderBottomWidth: 1 },
  rowLast: { borderBottomWidth: 0 },
  iconBox: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
})
