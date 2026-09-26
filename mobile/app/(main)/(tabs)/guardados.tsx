import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Text } from '@/components/ui/Text'
import { DetailSheet } from '@/components/v2/detail/DetailSheet'
import { ActivityList, RemindersList, SavedList } from '@/components/v2/guardados/GuardadosLists'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { SegmentedControl } from '@/components/v2/SegmentedControl'
import { ToastHost } from '@/components/v2/ToastHost'
import { Colors } from '@/constants/colors'
import { GUARDADOS_TEXT } from '@/lib/feed-v2/labels'
import { useGuardados } from '@/lib/feed-v2/use-guardados'

type Segment = 'saved' | 'reminders' | 'activity'

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'saved', label: GUARDADOS_TEXT.tabSaved },
  { value: 'reminders', label: GUARDADOS_TEXT.tabReminders },
  { value: 'activity', label: GUARDADOS_TEXT.tabActivity },
]

// Guardados v2 (README §3.5): Guardados · Recordatorios · Actividad.
export default function GuardadosScreen() {
  const insets = useSafeAreaInsets()
  const bottomSpace = useFloatingTabBarSpace()
  const [segment, setSegment] = useState<Segment>('saved')
  const g = useGuardados()

  function body() {
    if (g.status === 'loading') return <ActivityIndicator color={Colors.v2.limeText} style={styles.loading} />
    if (g.status === 'error') {
      return (
        <TouchableOpacity onPress={g.retry} accessibilityRole="button" style={styles.error}>
          <Text family="noto-sans" size={15} color={Colors.v2.muted}>{GUARDADOS_TEXT.error}</Text>
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.limeText}>{GUARDADOS_TEXT.retry}</Text>
        </TouchableOpacity>
      )
    }
    if (segment === 'saved') return <SavedList items={g.page.saved} onOpen={g.actions.openDetail} />
    if (segment === 'reminders') {
      return <RemindersList entries={g.page.reminders} onOpen={g.actions.openDetail} onToggle={g.toggleReminder} />
    }
    return <ActivityList activity={g.page.activity} />
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: bottomSpace + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text family="noto-sans" weight="extrabold" size={32} lineHeight={35} color={Colors.v2.navy} style={styles.h1}>
          {GUARDADOS_TEXT.title}
        </Text>
        <SegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
        {body()}
      </ScrollView>
      <ToastHost />
      <DetailSheet item={g.detailItem} actions={g.actions} onClose={g.closeDetail} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingHorizontal: 18, gap: 18 },
  h1: { letterSpacing: -0.8 },
  loading: { marginTop: 32 },
  error: { backgroundColor: Colors.v2.surface, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
})
