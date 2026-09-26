import { useMemo, useState } from 'react'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { FormField } from '@/components/v2/form/FormField'
import { ChoiceChips } from '@/components/v2/onboarding/ChoiceChips'
import { ConsentPicker, NotificationsPicker, OrgsPicker, WelcomeItems } from '@/components/v2/onboarding/SpecialSteps'
import { StepShell } from '@/components/v2/onboarding/StepShell'
import { useApp } from '@/lib/app-context'
import { HOME_ROUTE } from '@/lib/feature-flags'
import { ONBOARDING_TEXT as T } from '@/lib/feed-v2/labels'
import { claimWelcomePoints } from '@/lib/feed-v2/points'
import { departments, professions } from '@/lib/mock-data'
import { GOAL_OPTIONS, PRODUCTION_BY_RUBRO, RUBRO_OPTIONS, rubrosToCategories, saveOnboardingExtras, SCALE_OPTIONS } from '@/lib/onboarding-v2'
import { registerPushToken } from '@/lib/push-notifications'
import type { Department, NotificationPreferences, Profession } from '@/lib/types'

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

interface Step {
  title: string
  body?: string
  content?: React.ReactNode
  canContinue: boolean
  optional?: boolean
}

// Onboarding v2 (ONBOARDING-V2.md): un concepto por pantalla, ≤ 60 segundos, y al terminar +50 pts
// de bienvenida (los otorga el servidor, idempotente). El login no cambia.
export function OnboardingV2() {
  const { onboarding, completeOnboarding, session } = useApp()
  const [i, setI] = useState(0)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState(onboarding.name)
  const [rubros, setRubros] = useState<string[]>([])
  const [production, setProduction] = useState<string[]>([])
  const [profession, setProfession] = useState<Profession | null>(null)
  const [scale, setScale] = useState<string | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [goals, setGoals] = useState<string[]>([])
  const [orgs, setOrgs] = useState<string[]>([])
  const [prefs, setPrefs] = useState<NotificationPreferences>({ breakingNews: true, priceAlerts: true, weatherAlerts: true, institutionalUpdates: true })
  const [phone, setPhone] = useState(onboarding.phone)
  const [terms, setTerms] = useState(false)
  const [points, setPoints] = useState(true)

  const productionOptions = useMemo(() => rubros.flatMap((r) => PRODUCTION_BY_RUBRO[r] ?? []), [rubros])

  const steps: Step[] = [
    { title: T.welcomeTitle, body: T.welcomeBody, content: <WelcomeItems />, canContinue: true },
    { title: T.nameTitle, content: <FormField label={T.nameLabel} value={name} onChangeText={setName} maxLength={60} autoCapitalize="words" />, canContinue: name.trim().length >= 2 },
    { title: T.rubrosTitle, body: T.rubrosBody, content: <ChoiceChips options={RUBRO_OPTIONS} selected={rubros} onToggle={(v) => setRubros((l) => toggle(l, v))} />, canContinue: rubros.length > 0 },
    { title: T.productionTitle, body: T.productionBody, content: <ChoiceChips options={productionOptions} selected={production} onToggle={(v) => setProduction((l) => toggle(l, v))} />, canContinue: true, optional: true },
    { title: T.professionTitle, content: <ChoiceChips options={professions} selected={profession ? [profession] : []} onToggle={(v) => setProfession(v as Profession)} />, canContinue: profession !== null },
    { title: T.scaleTitle, body: T.scaleBody, content: <ChoiceChips options={SCALE_OPTIONS} selected={scale ? [scale] : []} onToggle={(v) => setScale((s) => (s === v ? null : v))} />, canContinue: true, optional: true },
    { title: T.departmentTitle, body: T.departmentBody, content: <ChoiceChips options={departments} selected={department ? [department] : []} onToggle={(v) => setDepartment(v as Department)} />, canContinue: department !== null },
    { title: T.goalsTitle, body: T.goalsBody, content: <ChoiceChips options={GOAL_OPTIONS} selected={goals} onToggle={(v) => setGoals((l) => toggle(l, v))} />, canContinue: goals.length > 0 },
    { title: T.orgsTitle, body: T.orgsBody, content: <OrgsPicker selected={orgs} onToggle={(v) => setOrgs((l) => toggle(l, v))} />, canContinue: true, optional: true },
    { title: T.notifTitle, body: T.notifBody, content: <NotificationsPicker prefs={prefs} onChange={setPrefs} />, canContinue: true, optional: true },
    { title: T.phoneTitle, body: T.phoneBody, content: <FormField label={T.phoneLabel} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} />, canContinue: true, optional: true },
    { title: T.consentTitle, content: <ConsentPicker terms={terms} points={points} onTerms={() => setTerms((t) => !t)} onPoints={() => setPoints((p) => !p)} />, canContinue: terms },
  ]
  const step = steps[i]
  const last = i === steps.length - 1

  async function finish() {
    if (!profession || !department) return
    setBusy(true)
    await completeOnboarding({
      name: name.trim(),
      phone: phone.trim(),
      profession,
      department,
      preferences: rubrosToCategories(rubros),
      organizationSubscriptions: orgs,
      notificationPrefs: prefs,
    })
    const userId = session?.user.id
    if (userId) {
      // Best-effort: si algo de esto falla, la persona igual entra al feed.
      await saveOnboardingExtras(userId, { rubros, production, goals, scale }).catch(() => null)
      if (points) await claimWelcomePoints().catch(() => 0)
      const perm = await Notifications.getPermissionsAsync().catch(() => null)
      if (perm?.status === 'granted') registerPushToken(userId).catch(() => null)
    }
    router.replace(HOME_ROUTE)
  }

  return (
    <StepShell
      progress={(i + 1) / steps.length}
      title={step.title}
      body={step.body}
      primaryLabel={busy ? T.finishing : last ? T.finish : T.next}
      primaryDisabled={!step.canContinue}
      busy={busy}
      onPrimary={() => (last ? void finish() : setI(i + 1))}
      onBack={i > 0 && !busy ? () => setI(i - 1) : undefined}
      onSkip={step.optional ? () => setI(i + 1) : undefined}
    >
      {step.content}
    </StepShell>
  )
}
