import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { TYPE_LABEL } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'

const THUMB = 64

interface Props {
  item: FeedContentItem
  onPress: () => void
  /** Texto de la última línea; por defecto, la organización. */
  meta?: string
  /** Algo a la derecha (ej. el interruptor de un recordatorio). */
  trailing?: React.ReactNode
}

// Fila de contenido de las pantallas claras v2 (resultados de Explorar, Guardados, Recordatorios):
// miniatura + tipo + título + organización.
export function ContentRow({ item, onPress, meta, trailing }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button" style={styles.main}>
        {item.mediaUrl ? (
          <Image source={item.mediaUrl} style={styles.thumb} contentFit="cover" recyclingKey={`${item.key}-thumb`} />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty]} />
        )}
        <View style={styles.texts}>
          <Text family="noto-sans" weight="bold" size={11} color={Colors.v2.limeText} style={styles.type}>
            {TYPE_LABEL[item.contentType]}
          </Text>
          <Text family="noto-sans" weight="bold" size={16} lineHeight={20} color={Colors.v2.navy} numberOfLines={2}>
            {item.title}
          </Text>
          <Text family="noto-sans" size={13} color={Colors.v2.muted} numberOfLines={1}>
            {meta ?? item.organizationName}
          </Text>
        </View>
      </TouchableOpacity>
      {trailing}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: Colors.v2.surface },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: THUMB, height: THUMB, borderRadius: 14 },
  thumbEmpty: { backgroundColor: Colors.v2.limeTint },
  texts: { flex: 1, gap: 3 },
  type: { letterSpacing: 0.9 },
})
