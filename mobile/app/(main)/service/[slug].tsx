import { useState } from 'react'
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useApp } from '@/lib/app-context'
import { sendLead } from '@/lib/contact-lead'
import { SERVICE_TEXT as T } from '@/lib/feed-v2/labels'
import { SERVICES } from '@/lib/services-data'
import { WHATSAPP_URL } from '@/lib/social-links'

const V = Colors.v2

// Servicio de Agroconecta (v2): qué es + WhatsApp + pedido de contacto que llega a Consultas.
export default function ServiceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const service = SERVICES.find((s) => s.id === slug)
  const insets = useSafeAreaInsets()
  const { user } = useApp()
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [info, setInfo] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit() {
    if (!service || !phone.trim() || sending) return
    setSending(true)
    await sendLead({ userId: user?.id ?? null, serviceType: service.id, serviceLabel: service.label, phone, info })
    setSending(false)
    setSent(true)
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <V2ScreenHeader title={service?.label ?? T.notFound} />
        {service && (
          <View style={styles.body}>
            <View style={styles.icon}>
              <Ionicons name={service.icon} size={28} color={V.navy} />
            </View>
            <Text family="noto-sans" size={16} lineHeight={24} color={V.sheet.body}>{service.description}</Text>

            <TouchableOpacity onPress={() => Linking.openURL(WHATSAPP_URL).catch(() => null)} accessibilityRole="link" style={styles.whatsapp}>
              <Ionicons name="logo-whatsapp" size={22} color={V.white} />
              <Text family="noto-sans" weight="bold" size={16} color={V.white}>{T.whatsapp}</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              {sent ? (
                <View style={styles.sent}>
                  <Ionicons name="checkmark-circle" size={44} color={V.limeText} />
                  <Text family="noto-sans" weight="extrabold" size={18} color={V.navy}>{T.sentTitle}</Text>
                  <Text family="noto-sans" size={15} lineHeight={21} color={V.muted} style={styles.center}>{T.sentBody}</Text>
                </View>
              ) : (
                <>
                  <Text family="noto-sans" weight="extrabold" size={17} color={V.navy}>{T.formTitle}</Text>
                  <TextInput value={phone} onChangeText={setPhone} placeholder={T.phone} placeholderTextColor={V.light.placeholder} keyboardType="phone-pad" style={styles.input} />
                  <TextInput
                    value={info}
                    onChangeText={setInfo}
                    placeholder={T.info}
                    placeholderTextColor={V.light.placeholder}
                    multiline
                    textAlignVertical="top"
                    style={[styles.input, styles.textarea]}
                  />
                  <TouchableOpacity onPress={submit} disabled={!phone.trim() || sending} accessibilityRole="button" style={[styles.send, (!phone.trim() || sending) && styles.off]}>
                    <Text family="noto-sans" weight="bold" size={16} color={V.white}>{sending ? T.sending : T.send}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  center: { textAlign: 'center' },
  body: { paddingHorizontal: 18, gap: 16 },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: V.lime, alignItems: 'center', justifyContent: 'center' },
  whatsapp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: V.whatsapp },
  card: { backgroundColor: V.surface, borderRadius: 22, padding: 16, gap: 12 },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: V.light.inputBorder,
    backgroundColor: V.ground,
    paddingHorizontal: 14,
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    color: V.navy,
  },
  textarea: { minHeight: 100, paddingTop: 12 },
  send: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: V.navy, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.4 },
  sent: { alignItems: 'center', gap: 8, paddingVertical: 8 },
})
