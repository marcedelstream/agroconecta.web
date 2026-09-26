import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { Colors } from '@/constants/colors'

interface Props {
  label: string
  /** Rojo para EN VIVO; el ámbar de PATROCINADO llega en la Fase 4. */
  dotColor?: string
}

export function TypeChip({ label, dotColor = Colors.v2.lime }: Props) {
  return (
    <GlassSurface
      tint="dark"
      overlayColor={Colors.v2.glass.bg}
      androidColor={Colors.v2.feed.glassAndroid}
      borderColor={Colors.v2.glass.border}
      style={styles.chip}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text family="noto-sans" weight="bold" size={11} lineHeight={14} color={Colors.v2.white} style={styles.label}>
        {label}
      </Text>
    </GlassSurface>
  )
}

const styles = StyleSheet.create({
  chip: { height: 26, borderRadius: 13, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { letterSpacing: 1 },
})
