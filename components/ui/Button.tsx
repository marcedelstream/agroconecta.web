import { TouchableOpacity, ActivityIndicator, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { Text } from './Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  onPress?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  children: React.ReactNode
}

const sizeStyles: Record<Size, { container: ViewStyle; fontSize: number }> = {
  sm: { container: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5], borderRadius: Radius.md }, fontSize: 13 },
  md: { container: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], borderRadius: Radius.base }, fontSize: 15 },
  lg: { container: { paddingHorizontal: Spacing[6], paddingVertical: Spacing[4], borderRadius: Radius.lg }, fontSize: 16 },
}

export function Button({ onPress, variant = 'primary', size = 'md', disabled, loading, fullWidth, style, textStyle, children }: Props) {
  const C = useColors()
  const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
    primary: { container: { backgroundColor: Colors.lime }, text: { color: '#0A0A13' } },
    secondary: { container: { backgroundColor: C.secondary }, text: { color: C.foreground } },
    outline: { container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border }, text: { color: C.foreground } },
    ghost: { container: { backgroundColor: 'transparent' }, text: { color: C.foreground } },
    destructive: { container: { backgroundColor: Colors.destructive }, text: { color: '#FFFFFF' } },
  }
  const vStyle = variantStyles[variant]
  const sStyle = sizeStyles[size]

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.base, vStyle.container, sStyle.container, fullWidth && styles.fullWidth, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text.color as string} size="small" />
      ) : (
        <Text variant="label" weight="semibold" family="dm-sans" style={[{ fontSize: sStyle.fontSize }, vStyle.text, textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
})
