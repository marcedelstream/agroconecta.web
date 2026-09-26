import { StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { CTA_LABEL, type CtaKind } from '@/lib/feed-v2/labels'

type Placement =
  /** Fijo abajo, siempre en el mismo lugar (items de contenido). */
  | { bottom: number; side: number }
  /** En el flujo, debajo del contenido (tarjeta de precios, que va centrada si es poca info). */
  | { inline: true }

type Props = Placement & {
  type: CtaKind
  onPress: () => void
}

// Botón de acción estandarizado (README §3.1): misma posición, tamaño y estilo siempre; el único
// componente que decide el texto según el tipo.
export function ContentCTA(props: Props) {
  const { type, onPress } = props
  const label = CTA_LABEL[type]
  const position = 'inline' in props ? null : [styles.fixed, { bottom: props.bottom, left: props.side, right: props.side }]
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.cta, position]}
    >
      <Text family="noto-sans" weight="bold" size={16} lineHeight={20} color={Colors.v2.navy}>
        {label}
      </Text>
      <Ionicons name="arrow-forward" size={18} color={Colors.v2.navy} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fixed: { position: 'absolute' },
  cta: {
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
