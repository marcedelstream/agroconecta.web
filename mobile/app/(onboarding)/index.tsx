import { useEffect, useRef, useState } from 'react'
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '@/lib/app-context'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { professions, newsCategories, departments, mockOrganizations } from '@/lib/mock-data'
import { fetchOrganizations } from '@/lib/supabase-repositories'
import type { Profession, Department, NewsCategory, Organization } from '@/lib/types'

const TOTAL_STEPS = 5

export default function OnboardingScreen() {
  const { onboarding, updateOnboarding, nextStep, prevStep, completeOnboarding } = useApp()
  const [localName, setLocalName] = useState(onboarding.name)
  const slideAnim = useRef(new Animated.Value(0)).current

  function animateNext(direction: 1 | -1 = 1) {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -direction * 20, duration: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start()
  }

  function handleNext() {
    if (onboarding.step === 0) {
      if (localName.trim().length < 2) return
      updateOnboarding({ name: localName.trim() })
    }
    animateNext(1)
    nextStep()
  }

  function handleBack() {
    animateNext(-1)
    prevStep()
  }

  async function handleComplete() {
    await completeOnboarding()
    router.replace('/(main)/(tabs)/home')
  }

  const canProceed = () => {
    switch (onboarding.step) {
      case 0: return localName.trim().length >= 2
      case 1: return onboarding.profession !== null
      case 2: return onboarding.department !== null
      case 3: return onboarding.preferences.length > 0
      case 4: return true
      default: return false
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        {onboarding.step > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= onboarding.step && styles.progressDotActive, i < onboarding.step && styles.progressDotDone]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {onboarding.step === 0 && (
            <StepName
              name={localName}
              onNameChange={setLocalName}
            />
          )}
          {onboarding.step === 1 && (
            <StepProfession
              selected={onboarding.profession}
              onSelect={(p) => updateOnboarding({ profession: p })}
            />
          )}
          {onboarding.step === 2 && (
            <StepDepartment
              selected={onboarding.department}
              onSelect={(d) => updateOnboarding({ department: d })}
            />
          )}
          {onboarding.step === 3 && (
            <StepPreferences
              selected={onboarding.preferences}
              onToggle={(cat) => {
                const current = onboarding.preferences
                const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat]
                updateOnboarding({ preferences: next })
              }}
            />
          )}
          {onboarding.step === 4 && (
            <StepMedia
              selected={onboarding.organizationSubscriptions}
              onToggle={(id) => {
                const current = onboarding.organizationSubscriptions
                const next = current.includes(id) ? current.filter((m) => m !== id) : [...current, id]
                updateOnboarding({ organizationSubscriptions: next, mediaPreferences: next })
              }}
            />
          )}
        </ScrollView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          onPress={onboarding.step === TOTAL_STEPS - 1 ? handleComplete : handleNext}
          disabled={!canProceed()}
          fullWidth
          size="lg"
        >
          {onboarding.step === TOTAL_STEPS - 1 ? 'Comenzar' : 'Siguiente'}
        </Button>
        <Text variant="caption" color={Colors.muted} style={styles.stepText}>
          Paso {onboarding.step + 1} de {TOTAL_STEPS}
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

function StepName({
  name,
  onNameChange,
}: {
  name: string
  onNameChange: (v: string) => void
}) {
  return (
    <View style={styles.step}>
      <Ionicons name="person-circle-outline" size={56} color={Colors.lime} style={styles.stepIcon} />
      <Text variant="title" style={styles.stepTitle}>¿Cómo te llamás?</Text>
      <Text variant="body" color={Colors.muted} style={styles.stepDesc}>
        Ingresá tu nombre para personalizar tu experiencia en Agroconecta.
      </Text>
      <TextInput
        value={name}
        onChangeText={onNameChange}
        placeholder="Tu nombre"
        placeholderTextColor={Colors.muted}
        style={styles.input}
        autoFocus
        returnKeyType="next"
      />
    </View>
  )
}

function StepProfession({ selected, onSelect }: { selected: Profession | null; onSelect: (p: Profession) => void }) {
  return (
    <View style={styles.step}>
      <Ionicons name="briefcase-outline" size={56} color={Colors.lime} style={styles.stepIcon} />
      <Text variant="title" style={styles.stepTitle}>¿Cuál es tu actividad?</Text>
      <Text variant="body" color={Colors.muted} style={styles.stepDesc}>
        Seleccioná la opción que mejor te describe.
      </Text>
      <View style={styles.optionGrid}>
        {professions.map((p) => (
          <TouchableOpacity
            key={p.value}
            onPress={() => onSelect(p.value)}
            style={[styles.optionItem, selected === p.value && styles.optionItemActive]}
          >
            <Text variant="body" weight="medium" style={selected === p.value ? { color: '#0A0A13' } : { color: Colors.foreground }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

function StepDepartment({ selected, onSelect }: { selected: Department | null; onSelect: (d: Department) => void }) {
  return (
    <View style={styles.step}>
      <Ionicons name="location-outline" size={56} color={Colors.lime} style={styles.stepIcon} />
      <Text variant="title" style={styles.stepTitle}>¿Dónde estás?</Text>
      <Text variant="body" color={Colors.muted} style={styles.stepDesc}>
        Seleccioná tu departamento para recibir información relevante a tu zona.
      </Text>
      <View style={styles.optionGrid}>
        {departments.map((d) => (
          <TouchableOpacity
            key={d.value}
            onPress={() => onSelect(d.value)}
            style={[styles.optionItem, selected === d.value && styles.optionItemActive]}
          >
            <Text variant="body" weight="medium" style={selected === d.value ? { color: '#0A0A13' } : { color: Colors.foreground }}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

function StepPreferences({ selected, onToggle }: { selected: NewsCategory[]; onToggle: (c: NewsCategory) => void }) {
  return (
    <View style={styles.step}>
      <Ionicons name="newspaper-outline" size={56} color={Colors.lime} style={styles.stepIcon} />
      <Text variant="title" style={styles.stepTitle}>¿Qué te interesa?</Text>
      <Text variant="body" color={Colors.muted} style={styles.stepDesc}>
        Elegí los temas que quieras ver en tu feed. Podés elegir varios.
      </Text>
      <View style={styles.optionGrid}>
        {newsCategories.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => onToggle(cat.value)}
            style={[styles.optionItem, selected.includes(cat.value) && styles.optionItemActive]}
          >
            <Text variant="body" weight="medium" style={selected.includes(cat.value) ? { color: '#0A0A13' } : { color: Colors.foreground }}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const mediaPublishers = mockOrganizations.filter((org) =>
  ['media', 'asociacion', 'institucion', 'gremio', 'rematadora'].includes(org.category),
)

function StepMedia({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const [organizations, setOrganizations] = useState<Organization[]>(mediaPublishers)

  useEffect(() => {
    let mounted = true
    fetchOrganizations()
      .then((remoteOrganizations) => {
        const followable = remoteOrganizations.filter((org) =>
          ['media', 'asociacion', 'institucion', 'gremio', 'rematadora'].includes(org.category),
        )
        if (mounted && followable.length > 0) setOrganizations(followable)
      })
      .catch(() => {
        if (mounted) setOrganizations(mediaPublishers)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <View style={styles.step}>
      <Ionicons name="radio-outline" size={56} color={Colors.lime} style={styles.stepIcon} />
      <Text variant="title" style={styles.stepTitle}>¿Qué cuentas querés seguir?</Text>
      <Text variant="body" color={Colors.muted} style={styles.stepDesc}>
        Elegí asociaciones, instituciones, medios o rematadoras. Podés saltear este paso.
      </Text>
      <View style={styles.mediaGrid}>
        {organizations.map((pub) => {
          const isActive = selected.includes(pub.id)
          return (
            <TouchableOpacity
              key={pub.id}
              onPress={() => onToggle(pub.id)}
              style={[styles.mediaTile, isActive && styles.mediaItemActive]}
              activeOpacity={0.8}
            >
              <View style={[styles.mediaLogo, isActive && styles.mediaLogoActive]}>
                {pub.logoUrl ? (
                  <Image source={{ uri: pub.logoUrl }} style={styles.mediaLogoImage} resizeMode="cover" />
                ) : (
                  <Text variant="body" weight="bold" style={isActive ? { color: '#0A0A13' } : { color: Colors.lime }}>
                    {pub.name.slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text
                variant="caption"
                weight="semibold"
                numberOfLines={2}
                style={[styles.mediaTileName, isActive ? { color: '#0A0A13' } : { color: Colors.foreground }]}
              >
                {pub.name}
              </Text>
              {isActive && <Ionicons name="checkmark-circle" size={16} color="#0A0A13" style={styles.mediaCheck} />}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[5], paddingTop: Spacing[14], paddingBottom: Spacing[4], gap: Spacing[3] },
  backBtn: { padding: Spacing[2], marginRight: Spacing[2] },
  progressContainer: { flex: 1, flexDirection: 'row', gap: Spacing[2] },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.lime },
  progressDotDone: { backgroundColor: Colors.limeDark },
  content: { flex: 1 },
  scroll: { paddingHorizontal: Spacing[5], paddingTop: Spacing[4], paddingBottom: Spacing[4] },
  step: { gap: Spacing[4] },
  stepIcon: { alignSelf: 'flex-start' },
  stepTitle: { marginTop: Spacing[2] },
  stepDesc: { lineHeight: 22 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    color: Colors.foreground,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    marginTop: Spacing[2],
  },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[2] },
  optionItem: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionItemActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  footer: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10], paddingTop: Spacing[4], gap: Spacing[3], alignItems: 'center' },
  stepText: { textAlign: 'center' },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[2] },
  mediaTile: {
    width: '31%',
    minHeight: 126,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.surface,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[2],
  },
  mediaItemActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  mediaLogo: { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: `${Colors.lime}18`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  mediaLogoActive: { backgroundColor: 'rgba(10,10,19,0.08)' },
  mediaLogoImage: { width: '100%', height: '100%' },
  mediaTileName: { textAlign: 'center', minHeight: 34 },
  mediaCheck: { position: 'absolute', top: Spacing[2], right: Spacing[2] },
})
