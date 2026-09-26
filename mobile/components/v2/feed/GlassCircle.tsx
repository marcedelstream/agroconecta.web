import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native'
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
// TouchableOpacity con estilo fijo, no Pressable con style={({ pressed }) => …}: NativeWind v4
// envuelve Pressable y descarta ese estilo en función (el botón perdía tamaño y posición).
export function GlassCircle({ size, onPress, accessibilityLabel, selected, style, children }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={4}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    >
      <GlassSurface
        tint="dark"
        overlayColor={Colors.v2.glass.bg}
        androidColor={Colors.v2.android.tonal}
        borderColor={Colors.v2.glass.border}
        style={[styles.fill, { width: size, height: size, borderRadius: size / 2 }]}
      >
        {children}
      </GlassSurface>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fill: { alignItems: 'center', justifyContent: 'center' },
})
