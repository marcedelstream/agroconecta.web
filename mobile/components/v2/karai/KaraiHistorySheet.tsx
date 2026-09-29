import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { V2Sheet } from '@/components/v2/V2Sheet'
import { Colors } from '@/constants/colors'
import { deleteKaraiConversation, fetchKaraiConversations, type KaraiConversation } from '@/lib/feed-v2/karai'
import { KARAI_HISTORY_TEXT as T } from '@/lib/feed-v2/labels'

interface Props {
  activeId: string | null
  onOpen: (id: string) => void
  onClose: () => void
}

function when(iso: string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days === 0) return T.today
  if (days === 1) return T.yesterday
  return d.toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })
}

// Historial de chats con Karai (como en ChatGPT): tocar uno lo abre y se sigue la conversación.
export function KaraiHistorySheet({ activeId, onOpen, onClose }: Props) {
  const [list, setList] = useState<KaraiConversation[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchKaraiConversations().then(setList).catch(() => setFailed(true))
  }, [])

  function remove(c: KaraiConversation) {
    Alert.alert(T.deleteTitle, T.deleteBody, [
      { text: T.cancel, style: 'cancel' },
      {
        text: T.delete,
        style: 'destructive',
        onPress: async () => {
          if (await deleteKaraiConversation(c.id)) setList((l) => (l ? l.filter((x) => x.id !== c.id) : l))
        },
      },
    ])
  }

  return (
    <V2Sheet title={T.title} subtitle={T.subtitle} onClose={onClose}>
      {failed ? (
        <Text family="noto-sans" size={15} color={Colors.v2.muted}>{T.error}</Text>
      ) : !list ? (
        <ActivityIndicator color={Colors.v2.limeText} />
      ) : list.length === 0 ? (
        <Text family="noto-sans" size={15} color={Colors.v2.muted}>{T.empty}</Text>
      ) : (
        <View style={styles.card}>
          {list.map((c, i) => (
            <View key={c.id} style={[styles.row, i < list.length - 1 && styles.divider]}>
              <TouchableOpacity onPress={() => onOpen(c.id)} accessibilityRole="button" style={styles.open}>
                <Ionicons name={c.id === activeId ? 'chatbubble' : 'chatbubble-outline'} size={18} color={Colors.v2.limeText} />
                <View style={styles.flex}>
                  <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy} numberOfLines={2}>{c.preview}</Text>
                  <Text family="noto-sans" size={12} color={Colors.v2.muted}>{when(c.lastMessageAt)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(c)} accessibilityRole="button" accessibilityLabel={T.delete} hitSlop={8} style={styles.trash}>
                <Ionicons name="trash-outline" size={18} color={Colors.v2.muted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </V2Sheet>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 20, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.v2.light.inputBorder },
  open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  trash: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
})
