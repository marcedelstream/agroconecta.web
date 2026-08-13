import { Linking, TouchableOpacity, View, StyleSheet, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'

interface Props {
  source: { uri: string }
  style?: ViewStyle | ViewStyle[]
  onError?: () => void
}

// react-native-pdf no soporta web — acá mostramos un fallback que abre el archivo
// en una pestaña nueva, donde el visor de PDF nativo del navegador lo muestra bien.
export function PdfReader({ source, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="document-text-outline" size={40} color={Colors.lime} />
      <Text variant="body" weight="semibold" style={styles.message}>
        La lectura de PDF no está disponible en la vista web.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL(source.uri)} activeOpacity={0.85}>
        <Text variant="body" weight="bold" style={styles.btnText}>Abrir en una pestaña nueva</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: Spacing[6] },
  message: { color: '#fff', marginTop: Spacing[3], textAlign: 'center' },
  btn: { marginTop: Spacing[4], backgroundColor: Colors.lime, borderRadius: 9999, paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] },
  btnText: { color: '#0A0A13' },
})
