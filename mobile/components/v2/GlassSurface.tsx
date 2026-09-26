import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'

interface Props {
  tint: 'light' | 'dark'
  intensity?: number
  /** Color translúcido que va encima del blur (iOS) o solo (Android). */
  overlayColor: string
  /** En Android no hay blur real: se usa este color, más opaco, para que el texto siga legible. */
  androidColor?: string
  borderColor?: string
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

// Encapsula expo-blur. En Android el blur es caro y se ve distinto según la versión, así que
// ahí se pinta un fondo translúcido sólido — el feed tiene que andar a 60 fps en gama media.
export function GlassSurface({ tint, intensity = 40, overlayColor, androidColor, borderColor, style, children }: Props) {
  const border = borderColor ? { borderWidth: StyleSheet.hairlineWidth * 2, borderColor } : null

  if (Platform.OS === 'android') {
    return <View style={[styles.clip, { backgroundColor: androidColor ?? overlayColor }, border, style]}>{children}</View>
  }

  return (
    <View style={[styles.clip, border, style]}>
      <BlurView tint={tint} intensity={intensity} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
})
