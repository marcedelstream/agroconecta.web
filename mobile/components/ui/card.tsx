import { View, type ViewStyle } from 'react-native'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
  padding?: keyof typeof Spacing | 0
  elevated?: boolean
}

export function Card({ children, style, padding = 4, elevated = false }: Props) {
  const C = useColors()
  const paddingValue = padding === 0 ? 0 : Spacing[padding as keyof typeof Spacing]
  return (
    <View
      style={[
        { backgroundColor: elevated ? C.secondary : C.surface, borderRadius: Radius.base, padding: paddingValue, borderWidth: 1, borderColor: C.border },
        style,
      ]}
    >
      {children}
    </View>
  )
}
