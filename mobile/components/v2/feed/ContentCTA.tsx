import { StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { CTA_LABEL, type CtaKind } from '@/lib/feed-v2/labels'

interface Props {
  type: CtaKind
  bottom: number
  side: number
  onPress: () => void
}

// Botón de acción estandarizado (README §3.1): misma posición, tamaño y estilo siempre; el único
// componente que decide el texto según el tipo.
export function ContentCTA({ type, bottom, side, onPress }: Props) {
  const label = CTA_LABEL[type]
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.cta, { bottom, left: side, right: side }]}
    >
      <Text family="noto-sans" weight="bold" size={16} lineHeight={20} color={Colors.v2.navy}>
        {label}
      </Text>
      <Ionicons name="arrow-forward" size={18} color={Colors.v2.navy} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cta: {
    position: 'absolute',
    height: V2Layout.ctaHeight,
    borderRadius: V2Layout.ctaRadius,
    backgroundColor: Colors.v2.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.v2.nav.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
})
