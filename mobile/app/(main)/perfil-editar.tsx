import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { EditProfileSheet } from '@/components/profile/EditProfileSheet'
import { FormField } from '@/components/v2/form/FormField'
import { ExperienceEditor } from '@/components/v2/profile/ExperienceEditor'
import { ToastHost } from '@/components/v2/ToastHost'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { useApp } from '@/lib/app-context'
import { EDIT_CV_TEXT, PROFILE_TEXT } from '@/lib/feed-v2/labels'
import { showToast } from '@/lib/feed-v2/toast'
import { goBack } from '@/lib/navigation'
import { EMPTY_CV, fetchProfileCV, normalizeSlug, PUBLIC_PROFILE_BASE, saveProfileCV, SOCIAL_KEYS, type ProfileCV } from '@/lib/profile-cv'
import { ReminderSwitch } from '@/components/v2/ReminderSwitch'

const Section = ({ title }: { title: string }) => (
  <Text family="noto-sans" weight="bold" size={12} color={Colors.v2.muted} style={styles.section}>{title}</Text>
)

// Editar el perfil CV v2 (README §3.6). Los datos básicos (nombre, profesión, departamento) se
// siguen editando con la hoja de la v1, que ya sincroniza con Supabase.
export default function EditCvScreen() {
  const insets = useSafeAreaInsets()
  const { user, updateUser } = useApp()
  const [cv, setCv] = useState<ProfileCV | null>(null)
  const [specialties, setSpecialties] = useState('')
  const [saving, setSaving] = useState(false)
  const [basicsOpen, setBasicsOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetchProfileCV(user.id)
      .then((data) => {
        setCv(data)
        setSpecialties(data.specialties.join(', '))
      })
      .catch(() => setCv(EMPTY_CV))
  }, [user?.id])

  const set = (change: Partial<ProfileCV>) => setCv((c) => (c ? { ...c, ...change } : c))

  async function save() {
    if (!user?.id || !cv || saving) return
    setSaving(true)
    const result = await saveProfileCV(user.id, { ...cv, specialties: specialties.split(',') })
    setSaving(false)
    const messages = { ok: EDIT_CV_TEXT.saved, slug_taken: EDIT_CV_TEXT.slugTaken, slug_invalid: EDIT_CV_TEXT.slugInvalid, error: EDIT_CV_TEXT.error }
    showToast(messages[result])
    if (result === 'ok') goBack()
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={EDIT_CV_TEXT.back} style={styles.circle}>
          <Ionicons name="chevron-back" size={20} color={Colors.v2.navy} />
        </TouchableOpacity>
        <Text family="noto-sans" weight="extrabold" size={20} color={Colors.v2.navy}>{EDIT_CV_TEXT.title}</Text>
        <TouchableOpacity onPress={save} disabled={!cv || saving} accessibilityRole="button" style={styles.save}>
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.white}>{saving ? EDIT_CV_TEXT.saving : EDIT_CV_TEXT.save}</Text>
        </TouchableOpacity>
      </View>

      {!cv || !user ? (
        <ActivityIndicator color={Colors.v2.limeText} style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setBasicsOpen(true)} accessibilityRole="button" style={styles.basics}>
            <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy} style={styles.flex}>{EDIT_CV_TEXT.basics}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.v2.muted} />
          </TouchableOpacity>

          <Section title={EDIT_CV_TEXT.sectionPro} />
          <FormField label={EDIT_CV_TEXT.headline} placeholder={EDIT_CV_TEXT.headlineHint} value={cv.headline} onChangeText={(headline) => set({ headline })} maxLength={80} />
          <FormField label={EDIT_CV_TEXT.currentOrg} placeholder={EDIT_CV_TEXT.currentOrgHint} value={cv.currentOrg} onChangeText={(currentOrg) => set({ currentOrg })} maxLength={80} />
          <FormField label={EDIT_CV_TEXT.education} placeholder={EDIT_CV_TEXT.educationHint} value={cv.education} onChangeText={(education) => set({ education })} maxLength={120} />
          <FormField label={EDIT_CV_TEXT.country} value={cv.country} onChangeText={(country) => set({ country })} maxLength={40} />
          <FormField label={EDIT_CV_TEXT.bio} placeholder={EDIT_CV_TEXT.bioHint} value={cv.bio} onChangeText={(bio) => set({ bio })} maxLength={600} multiline />
          <FormField label={EDIT_CV_TEXT.specialties} placeholder={EDIT_CV_TEXT.specialtiesHint} value={specialties} onChangeText={setSpecialties} maxLength={200} />

          <Section title={EDIT_CV_TEXT.sectionExp} />
          <ExperienceEditor value={cv.experience} onChange={(experience) => set({ experience })} />

          <Section title={EDIT_CV_TEXT.sectionPublic} />
          <View style={styles.basics}>
            <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy} style={styles.flex}>{EDIT_CV_TEXT.publicToggle}</Text>
            <ReminderSwitch value={cv.profilePublic} onChange={(profilePublic) => set({ profilePublic, slug: cv.slug || normalizeSlug(user.name) })} accessibilityLabel={EDIT_CV_TEXT.publicToggle} />
          </View>
          {cv.profilePublic && (
            <FormField
              label={`${EDIT_CV_TEXT.slug}: ${PUBLIC_PROFILE_BASE}${normalizeSlug(cv.slug)}`}
              placeholder={EDIT_CV_TEXT.slugHint}
              value={cv.slug}
              onChangeText={(slug) => set({ slug })}
              autoCapitalize="none"
              maxLength={40}
            />
          )}

          <Section title={EDIT_CV_TEXT.sectionSocial} />
          {SOCIAL_KEYS.map((k) => (
            <FormField
              key={k}
              label={PROFILE_TEXT.socialLabel[k]}
              placeholder={EDIT_CV_TEXT.socialHint}
              value={cv.socials[k] ?? ''}
              onChangeText={(v) => set({ socials: { ...cv.socials, [k]: v } })}
              autoCapitalize="none"
              keyboardType={k === 'website' ? 'url' : 'default'}
              maxLength={200}
            />
          ))}
        </ScrollView>
      )}

      {basicsOpen && user && (
        <EditProfileSheet
          name={user.name}
          department={user.department}
          profession={user.profession}
          onClose={(updated) => {
            if (updated) void updateUser(updated)
            setBasicsOpen(false)
          }}
        />
      )}
      <ToastHost />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 12 },
  circle: {
    width: V2Layout.minTouch,
    height: V2Layout.minTouch,
    borderRadius: V2Layout.minTouch / 2,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  save: { height: V2Layout.minTouch, paddingHorizontal: 18, borderRadius: V2Layout.minTouch / 2, backgroundColor: Colors.v2.navy, justifyContent: 'center' },
  loading: { marginTop: 48 },
  content: { paddingHorizontal: 18, gap: 14 },
  basics: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 16, borderRadius: 16, backgroundColor: Colors.v2.surface },
  flex: { flex: 1 },
  section: { letterSpacing: 1, marginTop: 8 },
})
