import { StyleSheet, View } from 'react-native'
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useToastMessage } from '@/lib/feed-v2/toast'

// Muestra los avisos de showToast(). Se monta una vez por "capa": en el feed y dentro de la ficha
// (que es un Modal y queda por encima de todo lo demás).
export function ToastHost() {
  const message = useToastMessage()
  const insets = useSafeAreaInsets()
  if (!message) return null
  return (
    <View style={[styles.wrap, { top: insets.top + 60 }]} pointerEvents="none">
      <Animated.View key={message} entering={FadeInUp.duration(200)} exiting={FadeOut.duration(150)} style={styles.toast} accessibilityLiveRegion="polite">
        <Text family="noto-sans" weight="semibold" size={14} lineHeight={19} color={Colors.v2.white} style={styles.text}>
          {message}
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 60 },
  toast: {
    maxWidth: 330,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: Colors.v2.toastBg,
    shadowColor: Colors.v2.nav.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  text: { textAlign: 'center' },
})
