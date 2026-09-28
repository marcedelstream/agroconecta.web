import type { ReactNode } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { goBack } from '@/lib/navigation'

interface Props {
  title: string
  subtitle?: string
  right?: ReactNode
}

// Cabecera de las pantallas secundarias v2: botón volver redondo + título grande sobre el fondo claro.
export function V2ScreenHeader({ title, subtitle, right }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => goBack()} accessibilityRole="button" accessibilityLabel="Volver" style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={Colors.v2.navy} />
        </TouchableOpacity>
        <View style={styles.flex} />
        {right}
      </View>
      {title ? <Text family="noto-sans" weight="extrabold" size={30} lineHeight={34} color={Colors.v2.navy} style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.muted}>{subtitle}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, gap: 6, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  flex: { flex: 1 },
  back: {
    width: V2Layout.minTouch,
    height: V2Layout.minTouch,
    borderRadius: V2Layout.minTouch / 2,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { letterSpacing: -0.6 },
})
