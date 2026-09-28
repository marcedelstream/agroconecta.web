import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Text } from '@/components/ui/Text'
import { DetailSheet } from '@/components/v2/detail/DetailSheet'
import { Colors } from '@/constants/colors'
import { fetchItem } from '@/lib/feed-v2/api'
import { SHARED_TEXT } from '@/lib/feed-v2/labels'
import type { FeedContentItem, FeedSource } from '@/lib/feed-v2/types'
import { useItemActions, type ItemUpdater } from '@/lib/feed-v2/use-item-actions'
import { goBack } from '@/lib/navigation'

// Link compartido (agroconecta://p/<source>/<id>, desde la página web /p/…): abre directo la ficha de
// esa publicación. Al cerrarla se vuelve al feed.
export default function SharedItemScreen() {
  const { source, id } = useLocalSearchParams<{ source: string; id: string }>()
  const [item, setItem] = useState<FeedContentItem | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchItem(source as FeedSource, id)
      .then(setItem)
      .catch(() => setFailed(true))
  }, [source, id])

  const update = useCallback<ItemUpdater>((fn) => setItem((i) => (i ? fn(i) : i)), [])
  const { actions } = useItemActions(update)

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      {failed ? (
        <View style={styles.center}>
          <Text family="noto-sans" size={16} color={Colors.v2.muted} style={styles.text}>{SHARED_TEXT.notFound}</Text>
          <TouchableOpacity onPress={() => goBack()} accessibilityRole="button">
            <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.limeText}>{SHARED_TEXT.goHome}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        !item && <ActivityIndicator color={Colors.v2.limeText} style={styles.center} />
      )}
      <DetailSheet item={item} actions={actions} onClose={() => goBack()} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  text: { textAlign: 'center' },
})
