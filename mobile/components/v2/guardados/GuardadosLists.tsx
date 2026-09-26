import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ContentRow } from '@/components/v2/ContentRow'
import { ReminderSwitch } from '@/components/v2/ReminderSwitch'
import { Colors } from '@/constants/colors'
import { GUARDADOS_TEXT } from '@/lib/feed-v2/labels'
import type { ActivitySummary, FeedContentItem, ReminderEntry } from '@/lib/feed-v2/types'

type IconName = React.ComponentProps<typeof Ionicons>['name']

function EmptyCard({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={32} color={Colors.v2.limeText} />
      <Text family="noto-sans" weight="bold" size={17} color={Colors.v2.navy} style={styles.center}>{title}</Text>
      <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.muted} style={styles.center}>{body}</Text>
    </View>
  )
}

export function SavedList({ items, onOpen }: { items: FeedContentItem[]; onOpen: (item: FeedContentItem) => void }) {
  if (items.length === 0) {
    return <EmptyCard icon="bookmark-outline" title={GUARDADOS_TEXT.emptySavedTitle} body={GUARDADOS_TEXT.emptySavedBody} />
  }
  return <View style={styles.list}>{items.map((item) => <ContentRow key={item.key} item={item} onPress={() => onOpen(item)} />)}</View>
}

function formatRemindAt(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${time}`
}

interface RemindersProps {
  entries: ReminderEntry[]
  onOpen: (item: FeedContentItem) => void
  onToggle: (item: FeedContentItem, enabled: boolean) => void
}

export function RemindersList({ entries, onOpen, onToggle }: RemindersProps) {
  if (entries.length === 0) {
    return <EmptyCard icon="notifications-outline" title={GUARDADOS_TEXT.emptyRemindersTitle} body={GUARDADOS_TEXT.emptyRemindersBody} />
  }
  return (
    <View style={styles.list}>
      <Text family="noto-sans" size={14} color={Colors.v2.muted}>{GUARDADOS_TEXT.remindersNote}</Text>
      {entries.map((r) => (
        <ContentRow
          key={r.item.key}
          item={r.item}
          meta={r.item.startsAt ? formatRemindAt(r.item.startsAt) : undefined}
          onPress={() => onOpen(r.item)}
          trailing={
            <ReminderSwitch
              value={r.enabled}
              onChange={(v) => onToggle(r.item, v)}
              accessibilityLabel={`${GUARDADOS_TEXT.reminderSwitch}: ${r.item.title}`}
            />
          }
        />
      ))}
    </View>
  )
}

const ACTIVITY_ICON: Record<ActivitySummary['kind'], IconName> = {
  viewed: 'eye-outline',
  events: 'calendar-outline',
  products: 'pricetag-outline',
}

export function ActivityList({ activity }: { activity: ActivitySummary[] }) {
  return (
    <View style={styles.list}>
      <Text family="noto-sans" size={14} color={Colors.v2.muted}>{GUARDADOS_TEXT.activityNote}</Text>
      {activity.map((a) => (
        <View key={a.kind} style={styles.activity}>
          <View style={styles.activityIcon}>
            <Ionicons name={ACTIVITY_ICON[a.kind]} size={20} color={Colors.v2.limeText} />
          </View>
          <View style={styles.activityTexts}>
            <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.navy}>{GUARDADOS_TEXT.activity[a.kind]}</Text>
            <Text family="noto-sans" size={13} lineHeight={18} color={Colors.v2.muted} numberOfLines={2}>
              {a.recent.length > 0 ? a.recent.join(' · ') : GUARDADOS_TEXT.activityNone}
            </Text>
          </View>
          <Text family="noto-sans" weight="extrabold" size={22} color={Colors.v2.navy}>{a.count}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  empty: { backgroundColor: Colors.v2.surface, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  center: { textAlign: 'center' },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, backgroundColor: Colors.v2.surface },
  activityIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.v2.limeTint, alignItems: 'center', justifyContent: 'center' },
  activityTexts: { flex: 1, gap: 2 },
})
