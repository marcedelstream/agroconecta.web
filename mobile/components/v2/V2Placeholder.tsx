import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { Colors } from '@/constants/colors'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface Props {
  icon: IconName
  title: string
  description: string
  dark?: boolean
}

// Estado provisorio de las tabs v2 mientras se construyen (Fase 1, bloques 1c–1e). Solo se ve
// con EXPO_PUBLIC_FEED_V2=true.
export function V2Placeholder({ icon, title, description, dark = false }: Props) {
  const insets = useSafeAreaInsets()
  const bottom = useFloatingTabBarSpace()
  const fg = dark ? Colors.v2.white : Colors.v2.navy
  const muted = dark ? Colors.v2.nav.darkIdle : Colors.v2.muted

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: dark ? Colors.v2.navy : Colors.v2.ground, paddingTop: insets.top, paddingBottom: bottom },
      ]}
    >
      <Ionicons name={icon} size={40} color={dark ? Colors.v2.lime : Colors.v2.limeText} />
      <Text family="noto-sans" weight="extrabold" size={26} lineHeight={30} color={fg} style={styles.center}>
        {title}
      </Text>
      <Text family="noto-sans" size={15} lineHeight={21} color={muted} style={styles.center}>
        {description}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  center: { textAlign: 'center' },
})
