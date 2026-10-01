import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { CATEGORY_LABEL } from '@/lib/feed-v2/labels'
import type { FeedContentType } from '@/lib/feed-v2/types'

type IconName = React.ComponentProps<typeof Ionicons>['name']

const CATEGORIES: { type: FeedContentType; icon: IconName }[] = [
  { type: 'noticia', icon: 'newspaper-outline' },
  { type: 'evento', icon: 'calendar-outline' },
  { type: 'video', icon: 'play-circle-outline' },
  { type: 'curso', icon: 'school-outline' },
  { type: 'servicio', icon: 'construct-outline' },
  { type: 'empleo', icon: 'briefcase-outline' },
  { type: 'remate', icon: 'hammer-outline' },
  { type: 'libro', icon: 'library-outline' },
]

const COLUMNS = 4
const GAP = 10

export function CategoryGrid({ onPick }: { onPick: (type: FeedContentType) => void }) {
  // 4 columnas exactas: ancho medido del contenedor menos los espacios entre columnas.
  const [tileWidth, setTileWidth] = useState(0)
  return (
    <View style={styles.grid} onLayout={(e) => setTileWidth((e.nativeEvent.layout.width - GAP * (COLUMNS - 1)) / COLUMNS)}>
      {CATEGORIES.map((c) => (
        <TouchableOpacity
          key={c.type}
          onPress={() => onPick(c.type)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={CATEGORY_LABEL[c.type]}
          style={[styles.tile, { width: tileWidth }]}
        >
          <View style={styles.icon}>
            <Ionicons name={c.icon} size={20} color={Colors.v2.limeText} />
          </View>
          <Text family="noto-sans" weight="semibold" size={12} color={Colors.v2.navy} numberOfLines={1}>
            {CATEGORY_LABEL[c.type]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    height: 84,
    borderRadius: 18,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.v2.limeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
