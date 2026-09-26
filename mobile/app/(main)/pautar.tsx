import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ServiceLeadForm } from '@/components/ui/ServiceLeadForm'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { AD_TEXT } from '@/lib/feed-v2/labels'
import { goBack } from '@/lib/navigation'

// "¿Querés pautar tu contenido acá?" (README §3.1): lead comercial por el mismo canal que los servicios
// (/api/service-lead → service_leads + mail).
export default function PautarScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={AD_TEXT.back} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={Colors.v2.navy} />
        </TouchableOpacity>
        <Text family="noto-sans" weight="extrabold" size={30} lineHeight={34} color={Colors.v2.navy}>{AD_TEXT.leadTitle}</Text>
        <Text family="noto-sans" size={16} lineHeight={23} color={Colors.v2.muted}>{AD_TEXT.leadBody}</Text>
        <ServiceLeadForm serviceId="publicidad" serviceLabel={AD_TEXT.leadLabel} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingHorizontal: 20, gap: 14 },
  back: {
    width: V2Layout.minTouch,
    height: V2Layout.minTouch,
    borderRadius: V2Layout.minTouch / 2,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
})
