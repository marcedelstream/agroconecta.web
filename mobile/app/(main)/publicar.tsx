import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ToastHost } from '@/components/v2/ToastHost'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { PickChips } from '@/components/v2/PickChips'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { PUBLISH_TEXT as T, RUBROS } from '@/lib/feed-v2/labels'
import { showToast } from '@/lib/feed-v2/toast'
import { goBack } from '@/lib/navigation'
import { fetchPublishingOrgs, submitPost, type PostKind, type PublishingOrg } from '@/lib/publish'

const V = Colors.v2

interface Picked {
  uri: string
  base64: string
  type: string
}

// Formulario para que una organización mande una nota o un video. Queda "En revisión" y lo aprueba el
// equipo en /admin/publicaciones.
export default function PublicarScreen() {
  const insets = useSafeAreaInsets()
  const [orgs, setOrgs] = useState<PublishingOrg[] | null>(null)
  const [orgId, setOrgId] = useState('')
  const [type, setType] = useState<PostKind>('article')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>(RUBROS[0].value)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [image, setImage] = useState<Picked | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetchPublishingOrgs()
      .then((list) => {
        setOrgs(list)
        setOrgId(list[0]?.id ?? '')
      })
      .catch(() => setOrgs([]))
  }, [])

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, base64: true, allowsEditing: true, aspect: [16, 9] })
    const a = result.assets?.[0]
    if (!result.canceled && a?.base64) setImage({ uri: a.uri, base64: a.base64, type: a.mimeType ?? 'image/jpeg' })
  }

  const valid = !!orgId && title.trim().length >= 5 && summary.trim().length >= 10 && (type === 'article' || youtubeUrl.trim().length > 0)

  async function submit() {
    if (!valid || sending) return
    setSending(true)
    const result = await submitPost({
      organizationId: orgId,
      type,
      title,
      summary,
      content,
      category,
      youtubeUrl: type === 'video' ? youtubeUrl : undefined,
      imageBase64: image?.base64,
      imageType: image?.type,
    })
    setSending(false)
    if (result.ok) setSent(true)
    else showToast(result.error || T.error)
  }

  const input = (value: string, onChange: (v: string) => void, placeholder: string, multiline = false, maxLength?: number) => (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={V.light.placeholder}
      multiline={multiline}
      maxLength={maxLength}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.input, multiline && styles.textarea]}
    />
  )

  if (sent) {
    return (
      <View style={[styles.root, styles.done, { paddingTop: insets.top + 60 }]}>
        <StatusBar style="dark" />
        <Ionicons name="checkmark-circle" size={64} color={V.limeText} />
        <Text family="noto-sans" weight="extrabold" size={24} color={V.navy} style={styles.center}>{T.sentTitle}</Text>
        <Text family="noto-sans" size={16} lineHeight={23} color={V.muted} style={styles.center}>{T.sentBody}</Text>
        <TouchableOpacity onPress={() => goBack()} accessibilityRole="button" style={[styles.send, styles.doneBtn]}>
          <Text family="noto-sans" weight="bold" size={16} color={V.white}>{T.back}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <V2ScreenHeader title={T.title} subtitle={T.subtitle} />
        {!orgs ? (
          <ActivityIndicator color={V.limeText} style={styles.loading} />
        ) : (
          <View style={styles.body}>
            {orgs.length > 1 && (
              <View style={styles.card}>
                <Text family="noto-sans" weight="bold" size={13} color={V.muted} style={styles.label}>{T.org}</Text>
                <PickChips options={orgs.map((o) => ({ value: o.id, label: o.name }))} value={orgId} onChange={setOrgId} />
              </View>
            )}
            <View style={styles.card}>
              <Text family="noto-sans" weight="bold" size={13} color={V.muted} style={styles.label}>{T.type}</Text>
              <PickChips options={T.types} value={type} onChange={(v) => setType(v as PostKind)} />
              <Text family="noto-sans" weight="bold" size={13} color={V.muted} style={styles.label}>{T.rubro}</Text>
              <PickChips options={RUBROS} value={category} onChange={setCategory} />
            </View>

            <View style={styles.card}>
              {input(title, setTitle, T.titlePlaceholder, false, 140)}
              {input(summary, setSummary, T.summaryPlaceholder, true, 300)}
              {type === 'video' ? input(youtubeUrl, setYoutubeUrl, T.youtubePlaceholder) : input(content, setContent, T.contentPlaceholder, true)}
            </View>

            <TouchableOpacity onPress={pickImage} accessibilityRole="button" style={[styles.card, styles.imageBox]}>
              {image ? (
                <Image source={image.uri} style={styles.preview} contentFit="cover" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={26} color={V.limeText} />
                  <Text family="noto-sans" weight="semibold" size={15} color={V.navy}>{T.image}</Text>
                  <Text family="noto-sans" size={13} color={V.muted}>{T.imageHint}</Text>
                </>
              )}
            </TouchableOpacity>

            <Text family="noto-sans" size={13} lineHeight={19} color={V.muted}>{T.review}</Text>
            <TouchableOpacity onPress={submit} disabled={!valid || sending} accessibilityRole="button" style={[styles.send, (!valid || sending) && styles.off]}>
              <Text family="noto-sans" weight="bold" size={16} color={V.white}>{sending ? T.sending : T.send}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <ToastHost />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  center: { textAlign: 'center' },
  loading: { marginTop: 40 },
  body: { paddingHorizontal: 18, gap: 14 },
  card: { backgroundColor: V.surface, borderRadius: 20, padding: 16, gap: 12 },
  label: { letterSpacing: 1 },
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
  textarea: { minHeight: 110, paddingTop: 12 },
  imageBox: { alignItems: 'center', justifyContent: 'center', minHeight: 140, overflow: 'hidden', padding: 0 },
  preview: { width: '100%', aspectRatio: 16 / 9 },
  send: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: V.navy, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.4 },
  done: { alignItems: 'center', gap: 12, paddingHorizontal: 28 },
  doneBtn: { alignSelf: 'stretch', marginTop: 12 },
})
