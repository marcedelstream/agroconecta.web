import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { GlassSurface } from '@/components/v2/GlassSurface'
import { Colors } from '@/constants/colors'

interface Props {
  size: number
  onPress: () => void
  accessibilityLabel: string
  selected?: boolean
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

// Botón redondo de vidrio sobre la foto (barra lateral, cabecera, play).
export function GlassCircle({ size, onPress, accessibilityLabel, selected, style, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={4}
      style={({ pressed }) => [{ width: size, height: size, opacity: pressed ? 0.8 : 1 }, style]}
    >
      <GlassSurface
        tint="dark"
        overlayColor={Colors.v2.glass.bg}
        androidColor={Colors.v2.feed.glassAndroid}
        borderColor={Colors.v2.glass.border}
        style={[styles.fill, { borderRadius: size / 2 }]}
      >
        {children}
      </GlassSurface>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
