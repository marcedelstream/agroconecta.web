import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { Text } from '@/components/ui/Text'
import { ReminderSwitch } from '@/components/v2/ReminderSwitch'
import { Colors } from '@/constants/colors'
import { ONBOARDING_TEXT } from '@/lib/feed-v2/labels'
import { fetchOrganizations } from '@/lib/supabase-repositories'
import type { NotificationPreferences, Organization } from '@/lib/types'

type IconName = React.ComponentProps<typeof Ionicons>['name']
const T = ONBOARDING_TEXT

export function WelcomeItems() {
  return (
    <View style={styles.list}>
      {T.welcomeItems.map((w) => (
        <View key={w.title} style={styles.welcome}>
          <View style={styles.welcomeIcon}><Ionicons name={w.icon as IconName} size={24} color={Colors.v2.navy} /></View>
          <View style={styles.flex}>
            <Text family="noto-sans" weight="bold" size={17} color={Colors.v2.navy}>{w.title}</Text>
            <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.muted}>{w.body}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

export function OrgsPicker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const [orgs, setOrgs] = useState<Organization[] | null>(null)
  useEffect(() => {
    fetchOrganizations().then(setOrgs).catch(() => setOrgs([]))
  }, [])
  if (!orgs) return <ActivityIndicator color={Colors.v2.limeText} />
  return (
    <View style={styles.list}>
      {orgs.map((o) => {
        const on = selected.includes(o.id)
        return (
          <TouchableOpacity key={o.id} onPress={() => onToggle(o.id)} activeOpacity={0.85} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={styles.org}>
            <View style={styles.orgLogo}>{o.logoUrl ? <Image source={o.logoUrl} style={styles.fill} contentFit="cover" /> : null}</View>
            <Text family="noto-sans" weight="semibold" size={16} color={Colors.v2.navy} style={styles.flex} numberOfLines={2}>{o.name}</Text>
            <Ionicons name={on ? 'checkmark-circle' : 'add-circle-outline'} size={26} color={on ? Colors.v2.limeText : Colors.v2.muted} />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

interface NotifProps {
  prefs: NotificationPreferences
  onChange: (prefs: NotificationPreferences) => void
}

// Pide el permiso con contexto (no apenas se abre la app) y deja elegir categorías (notification_prefs).
export function NotificationsPicker({ prefs, onChange }: NotifProps) {
  const [granted, setGranted] = useState(false)
  useEffect(() => {
    Notifications.getPermissionsAsync().then((r) => setGranted(r.status === 'granted')).catch(() => null)
  }, [])
  async function ask() {
    const r = await Notifications.requestPermissionsAsync()
    setGranted(r.status === 'granted')
  }
  const keys = Object.keys(T.notifCategories) as (keyof NotificationPreferences)[]
  return (
    <View style={styles.list}>
      <TouchableOpacity onPress={ask} disabled={granted} style={[styles.notifBtn, granted && styles.notifOn]} accessibilityRole="button">
        <Ionicons name={granted ? 'checkmark-circle' : 'notifications-outline'} size={20} color={granted ? Colors.v2.limeText : Colors.v2.white} />
        <Text family="noto-sans" weight="bold" size={16} color={granted ? Colors.v2.limeText : Colors.v2.white}>{granted ? T.notifOn : T.notifCta}</Text>
      </TouchableOpacity>
      {keys.map((k) => (
        <View key={k} style={styles.notifRow}>
          <Text family="noto-sans" weight="semibold" size={16} color={Colors.v2.navy} style={styles.flex}>{T.notifCategories[k]}</Text>
          <ReminderSwitch value={prefs[k]} onChange={(v) => onChange({ ...prefs, [k]: v })} accessibilityLabel={T.notifCategories[k]} />
        </View>
      ))}
    </View>
  )
}

function Check({ checked, label, onPress }: { checked: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="checkbox" accessibilityState={{ checked }} style={styles.check}>
      <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={26} color={checked ? Colors.v2.limeText : Colors.v2.muted} />
      <Text family="noto-sans" size={16} lineHeight={22} color={Colors.v2.navy} style={styles.flex}>{label}</Text>
    </TouchableOpacity>
  )
}

export function ConsentPicker({ terms, points, onTerms, onPoints }: { terms: boolean; points: boolean; onTerms: () => void; onPoints: () => void }) {
  return (
    <View style={styles.list}>
      <Check checked={terms} label={T.consentTerms} onPress={onTerms} />
      <Check checked={points} label={T.consentPoints} onPress={onPoints} />
      <View style={styles.links}>
        <TouchableOpacity onPress={() => router.push('/legal/terms' as never)} accessibilityRole="link"><Text family="noto-sans" weight="bold" size={14} color={Colors.v2.limeText}>{T.readTerms}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/legal/privacy' as never)} accessibilityRole="link"><Text family="noto-sans" weight="bold" size={14} color={Colors.v2.limeText}>{T.readPrivacy}</Text></TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  flex: { flex: 1 },
  fill: { width: '100%', height: '100%' },
  welcome: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', backgroundColor: Colors.v2.surface, borderRadius: 18, padding: 16 },
  welcomeIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center' },
  org: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: Colors.v2.surface },
  orgLogo: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: Colors.v2.limeTint },
  notifBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26, backgroundColor: Colors.v2.navy },
  notifOn: { backgroundColor: Colors.v2.limeTint },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, borderRadius: 16, backgroundColor: Colors.v2.surface },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 16, backgroundColor: Colors.v2.surface },
  links: { flexDirection: 'row', gap: 20, paddingHorizontal: 4 },
})
