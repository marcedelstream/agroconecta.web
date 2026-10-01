import { useState } from 'react'
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useApp } from '@/lib/app-context'
import { sendContactLead } from '@/lib/contact-lead'
import { CONTACT_TEXT as T } from '@/lib/feed-v2/labels'
import { goBack } from '@/lib/navigation'
import { SOCIAL_LINKS, WHATSAPP_URL } from '@/lib/social-links'

// Contacto v2: WhatsApp como camino principal (es lo más rápido para el público del agro), y si no, un
// formulario corto que llega al panel (Consultas) con el motivo elegido.
export default function ContactoScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useApp()
  const params = useLocalSearchParams<{ motivo?: string; mensaje?: string }>()
  const [reason, setReason] = useState<string>(params.motivo === 'publicar' ? T.publishReason : T.reasons[0])
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [message, setMessage] = useState(params.mensaje ?? '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit() {
    if (!phone.trim() || sending) return
    setSending(true)
    await sendContactLead({ userId: user?.id ?? null, phone, reason, message })
    setSending(false)
    setSent(true)
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={T.back} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={Colors.v2.navy} />
        </TouchableOpacity>

        <Text family="noto-sans" weight="bold" size={12} color={Colors.v2.limeText} style={styles.eyebrow}>{T.eyebrow}</Text>
        <Text family="noto-sans" weight="extrabold" size={30} lineHeight={34} color={Colors.v2.navy} style={styles.h1}>{T.title}</Text>
        <Text family="noto-sans" size={16} lineHeight={23} color={Colors.v2.muted}>{T.body}</Text>

        <TouchableOpacity onPress={() => Linking.openURL(WHATSAPP_URL).catch(() => null)} accessibilityRole="link" style={styles.whatsapp}>
          <Ionicons name="logo-whatsapp" size={24} color={Colors.v2.white} />
          <View style={styles.flex}>
            <Text family="noto-sans" weight="extrabold" size={17} color={Colors.v2.white}>{T.whatsapp}</Text>
            <Text family="noto-sans" size={13} color={Colors.v2.white}>{T.whatsappHint}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.v2.white} />
        </TouchableOpacity>

        <View style={styles.card}>
          {sent ? (
            <View style={styles.sent}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.v2.limeText} />
              <Text family="noto-sans" weight="extrabold" size={19} color={Colors.v2.navy} style={styles.center}>{T.sentTitle}</Text>
              <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.muted} style={styles.center}>{T.sentBody}</Text>
              <TouchableOpacity onPress={() => { setSent(false); setMessage('') }} accessibilityRole="button">
                <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.limeText}>{T.again}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text family="noto-sans" weight="extrabold" size={17} color={Colors.v2.navy}>{T.formTitle}</Text>
              <View style={styles.chips}>
                {T.reasons.map((r) => {
                  const on = r === reason
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setReason(r)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text family="noto-sans" weight="semibold" size={14} color={on ? Colors.v2.limeTintText : Colors.v2.navy}>{r}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={T.phoneHint}
                placeholderTextColor={Colors.v2.light.placeholder}
                keyboardType="phone-pad"
                accessibilityLabel={T.phone}
                style={styles.input}
              />
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={T.messageHint}
                placeholderTextColor={Colors.v2.light.placeholder}
                multiline
                textAlignVertical="top"
                accessibilityLabel={T.message}
                style={[styles.input, styles.textarea]}
              />
              <TouchableOpacity
                onPress={submit}
                disabled={!phone.trim() || sending}
                accessibilityRole="button"
                style={[styles.send, (!phone.trim() || sending) && styles.off]}
              >
                <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.white}>{sending ? T.sending : T.send}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text family="noto-sans" weight="bold" size={12} color={Colors.v2.muted} style={styles.eyebrow}>{T.follow}</Text>
        <View style={styles.socials}>
          {SOCIAL_LINKS.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => Linking.openURL(s.url).catch(() => null)}
              accessibilityRole="link"
              accessibilityLabel={s.label}
              style={styles.social}
            >
              <Ionicons name={s.icon} size={20} color={Colors.v2.navy} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingHorizontal: 20, gap: 14 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
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
  eyebrow: { letterSpacing: 1, marginTop: 6 },
  h1: { letterSpacing: -0.6 },
  whatsapp: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.v2.whatsapp, borderRadius: 22, padding: 18, marginTop: 6 },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 24, padding: 18, gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.v2.light.inputBorder, justifyContent: 'center' },
  chipOn: { backgroundColor: Colors.v2.limeTint, borderColor: Colors.v2.limeText },
  input: {
    minHeight: V2Layout.ctaHeight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.ground,
    paddingHorizontal: 16,
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    color: Colors.v2.navy,
  },
  textarea: { minHeight: 96, paddingTop: 14 },
  send: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: Colors.v2.navy, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.4 },
  sent: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  socials: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  social: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.v2.surface, alignItems: 'center', justifyContent: 'center' },
})
