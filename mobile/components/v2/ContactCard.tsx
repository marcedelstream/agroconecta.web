import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { CONTACT_TEXT } from '@/lib/feed-v2/labels'
import { WHATSAPP_URL } from '@/lib/social-links'

const T = CONTACT_TEXT.card

// Acceso visible a contactarnos (la app también es vidriera para generar contactos): WhatsApp directo
// o la pantalla de Contacto con el formulario.
export function ContactCard() {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="chatbubbles" size={22} color={Colors.v2.navy} />
      </View>
      <Text family="noto-sans" weight="extrabold" size={19} lineHeight={24} color={Colors.v2.white}>{T.title}</Text>
      <Text family="noto-sans" size={14} lineHeight={20} color={Colors.v2.feed.textSoft}>{T.body}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => Linking.openURL(WHATSAPP_URL).catch(() => null)}
          accessibilityRole="link"
          style={[styles.btn, styles.whatsapp]}
        >
          <Ionicons name="logo-whatsapp" size={18} color={Colors.v2.white} />
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.white}>{T.whatsapp}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(main)/contacto' as never)} accessibilityRole="button" style={[styles.btn, styles.more]}>
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy}>{T.more}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.v2.navy, borderRadius: 24, padding: 20, gap: 8 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  whatsapp: { backgroundColor: Colors.v2.whatsapp },
  more: { backgroundColor: Colors.v2.lime },
})
