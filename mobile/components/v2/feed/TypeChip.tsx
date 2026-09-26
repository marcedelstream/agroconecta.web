import { Platform, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/Text'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'

interface Props {
  label: string
  /** Rojo para EN VIVO. */
  dotColor?: string
  /** PATROCINADO: chip blanco con punto ámbar, para que se distinga siempre del contenido orgánico. */
  sponsored?: boolean
}

export function TypeChip({ label, dotColor = Colors.v2.lime, sponsored }: Props) {
  return (
    <GlassSurface
      tint="dark"
      overlayColor={sponsored ? Colors.v2.sponsorChipBg : Colors.v2.glass.bg}
      androidColor={sponsored ? Colors.v2.sponsorChipBg : Colors.v2.feed.glassAndroid}
      borderColor={Colors.v2.glass.border}
      style={styles.chip}
    >
      <View style={[styles.dot, { backgroundColor: sponsored ? Colors.v2.sponsor : dotColor }]} />
      <Text family="noto-sans" weight="bold" size={11} lineHeight={14} color={sponsored ? Colors.v2.navy : Colors.v2.white} style={styles.label}>
        {label}
      </Text>
    </GlassSurface>
  )
}

const styles = StyleSheet.create({
  chip: {
    height: 26,
    borderRadius: Platform.OS === 'android' ? V2Layout.android.chipRadius : 13,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { letterSpacing: 1 },
})
