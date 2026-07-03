import { View, StyleSheet, type ViewStyle } from 'react-native'
import { Text } from './Text'
import { Colors } from '@/constants/colors'
import { useColors } from '@/lib/theme-context'

type BadgeVariant = 'default' | 'lime' | 'outline' | 'ganaderia' | 'agricultura' | 'clima' | 'mercados' | 'tecnologia' | 'institucional' | 'eventos' | 'juegos' | 'streaming'

interface Props {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: ViewStyle
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  default: { bg: Colors.secondary, text: Colors.muted },
  lime: { bg: `${Colors.lime}20`, text: Colors.lime },
  outline: { bg: 'transparent', text: Colors.muted, border: Colors.border },
  ganaderia: { bg: `${Colors.category.ganaderia}20`, text: Colors.category.ganaderia },
  agricultura: { bg: `${Colors.category.agricultura}20`, text: Colors.category.agricultura },
  clima: { bg: `${Colors.category.clima}20`, text: Colors.category.clima },
  mercados: { bg: `${Colors.category.mercados}20`, text: Colors.category.mercados },
  tecnologia: { bg: `${Colors.category.tecnologia}20`, text: Colors.category.tecnologia },
  institucional: { bg: `${Colors.category.institucional}20`, text: Colors.category.institucional },
  eventos: { bg: `${Colors.ecosystem.eventos}20`, text: Colors.ecosystem.eventos },
  juegos: { bg: `${Colors.ecosystem.juegos}20`, text: Colors.ecosystem.juegos },
  streaming: { bg: `${Colors.ecosystem.streaming}20`, text: Colors.ecosystem.streaming },
}

export function Badge({ children, variant = 'default', style }: Props) {
  const C = useColors()
  const themeOverrides: Partial<Record<BadgeVariant, { bg: string; text: string; border?: string }>> = {
    default: { bg: C.secondary, text: C.muted },
    outline: { bg: 'transparent', text: C.muted, border: C.border },
  }
  const colors = themeOverrides[variant] ?? variantColors[variant] ?? variantColors.default
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, colors.border ? { borderWidth: 1, borderColor: colors.border } : null, style]}>
      <Text variant="label" style={{ color: colors.text, fontSize: 11 }}>
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
})
