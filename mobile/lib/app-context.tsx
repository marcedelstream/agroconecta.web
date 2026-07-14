import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { OnboardingState, UserProfile } from './types'

WebBrowser.maybeCompleteAuthSession()

const STORAGE_KEY = '@agroconecta:user'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeStoredUser(stored: string): UserProfile | null {
  try {
    const parsed = JSON.parse(stored) as UserProfile
    parsed.createdAt = new Date(parsed.createdAt)
    parsed.notificationPrefs ??= {
      breakingNews: true,
      priceAlerts: true,
      weatherAlerts: true,
      institutionalUpdates: false,
    }
    parsed.organizationSubscriptions ??= parsed.mediaPreferences ?? []
    parsed.mediaPreferences ??= parsed.organizationSubscriptions
    return parsed
  } catch (err) {
    console.warn('No se pudo leer el perfil local guardado.', err)
    return null
  }
}

function validUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

async function syncUserProfileToSupabase(profile: UserProfile): Promise<void> {
  if (!validUuid(profile.id)) return

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: profile.id,
    name: profile.name,
    email: profile.email ?? null,
    phone: profile.phone ?? null,
    profession: profile.profession,
    department: profile.department,
    notification_prefs: profile.notificationPrefs,
    updated_at: new Date().toISOString(),
  })
  if (profileError) throw profileError

  const { error: interestsDeleteError } = await supabase
    .from('user_interests')
    .delete()
    .eq('user_id', profile.id)
  if (interestsDeleteError) throw interestsDeleteError

  if (profile.preferences.length > 0) {
    const { error: interestsInsertError } = await supabase.from('user_interests').insert(
      profile.preferences.map((category) => ({ user_id: profile.id, category }))
    )
    if (interestsInsertError) throw interestsInsertError
  }

  const { error: subscriptionsDeleteError } = await supabase
    .from('user_subscriptions')
    .delete()
    .eq('user_id', profile.id)
  if (subscriptionsDeleteError) throw subscriptionsDeleteError

  const organizationIds = profile.organizationSubscriptions.filter(validUuid)
  if (organizationIds.length > 0) {
    const { error: subscriptionsInsertError } = await supabase.from('user_subscriptions').insert(
      organizationIds.map((organizationId) => ({ user_id: profile.id, organization_id: organizationId }))
    )
    if (subscriptionsInsertError) throw subscriptionsInsertError
  }
}

function syncUserProfileInBackground(profile: UserProfile) {
  syncUserProfileToSupabase(profile).catch((err) => {
    console.warn('No se pudo sincronizar el perfil con Supabase.', err)
  })
}

interface AppContextType {
  onboarding: OnboardingState
  updateOnboarding: (updates: Partial<OnboardingState>) => void
  nextStep: () => void
  prevStep: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
  resolveProfileForCurrentSession: () => Promise<boolean>
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  sendEmailOtp: (email: string) => Promise<string | null>
  verifyEmailOtp: (email: string, token: string) => Promise<string | null>
  signOut: () => Promise<void>
  session: Session | null
  authUser: User | null
  authLoading: boolean
  user: UserProfile | null
  isLoading: boolean
}

const initialOnboarding: OnboardingState = {
  step: 0,
  name: '',
  email: '',
  phone: '',
  profession: null,
  department: null,
  preferences: [],
  organizationSubscriptions: [],
  mediaPreferences: [],
  isComplete: false,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarding, setOnboarding] = useState<OnboardingState>(initialOnboarding)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = normalizeStoredUser(stored)
          if (parsed) {
            setUser(parsed)
            setOnboarding((prev) => ({ ...prev, isComplete: true }))
          }
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const updateOnboarding = useCallback((updates: Partial<OnboardingState>) => {
    setOnboarding((prev) => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    setOnboarding((prev) => ({ ...prev, step: prev.step + 1 }))
  }, [])

  const prevStep = useCallback(() => {
    setOnboarding((prev) => ({ ...prev, step: Math.max(0, prev.step - 1) }))
  }, [])

  const completeOnboarding = useCallback(async () => {
    const newUser: UserProfile = {
      id: session?.user.id ?? Math.random().toString(36).slice(2),
      name: onboarding.name,
      email: session?.user.email ?? onboarding.email,
      phone: onboarding.phone,
      profession: onboarding.profession!,
      department: onboarding.department!,
      preferences: onboarding.preferences,
      organizationSubscriptions: onboarding.organizationSubscriptions,
      mediaPreferences: onboarding.organizationSubscriptions,
      notificationPrefs: {
        breakingNews: true,
        priceAlerts: true,
        weatherAlerts: true,
        institutionalUpdates: true,
      },
      createdAt: new Date(),
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
    setOnboarding((prev) => ({ ...prev, isComplete: true }))
    syncUserProfileInBackground(newUser)
  }, [onboarding, session?.user.email, session?.user.id])

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setUser(updated)
    syncUserProfileInBackground(updated)
  }, [user])

  // Se llama justo despues de un login exitoso (Google u OTP) para decidir si hace falta
  // onboarding — no se puede confiar en el `user` cacheado en closure, porque el perfil
  // guardado en AsyncStorage puede pertenecer a OTRA cuenta que se logueo antes en este
  // mismo dispositivo.
  const resolveProfileForCurrentSession = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const authId = data.user?.id
    if (!authId) return true

    const stored = await AsyncStorage.getItem(STORAGE_KEY)
    const parsed = stored ? normalizeStoredUser(stored) : null

    if (parsed && parsed.id === authId) {
      setUser(parsed)
      setOnboarding((prev) => ({ ...prev, isComplete: true }))
      return false
    }

    if (parsed) await AsyncStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setOnboarding(initialOnboarding)
    return true
  }, [])

  const resetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setOnboarding(initialOnboarding)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectTo = Linking.createURL('auth/callback')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (error) return error.message
      if (!data?.url) return 'No se pudo iniciar el login con Google.'

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type !== 'success' || !result.url) return null

      const { params, errorCode } = QueryParams.getQueryParams(result.url)
      if (errorCode) return errorCode
      const { access_token, refresh_token } = params
      if (!access_token || !refresh_token) return null

      const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token })
      return sessionError?.message ?? null
    } catch (err) {
      return err instanceof Error ? err.message : 'No se pudo completar el login con Google.'
    }
  }, [])

  const sendEmailOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    return error?.message ?? null
  }, [])

  const verifyEmailOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // Perfil queda en AsyncStorage para no repetir onboarding al volver a entrar
  }, [])

  return (
    <AppContext.Provider
      value={{
        onboarding,
        updateOnboarding,
        nextStep,
        prevStep,
        completeOnboarding,
        resetOnboarding,
        updateUser,
        resolveProfileForCurrentSession,
        signIn,
        signUp,
        signInWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        signOut,
        session,
        authUser: session?.user ?? null,
        authLoading,
        user,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
