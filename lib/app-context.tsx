import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { OnboardingState, UserProfile } from './types'

const STORAGE_KEY = '@agroconecta:user'

interface AppContextType {
  onboarding: OnboardingState
  updateOnboarding: (updates: Partial<OnboardingState>) => void
  nextStep: () => void
  prevStep: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
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
          const parsed = JSON.parse(stored) as UserProfile
          parsed.createdAt = new Date(parsed.createdAt)
          if (!parsed.notificationPrefs) {
            parsed.notificationPrefs = {
              breakingNews: true,
              priceAlerts: true,
              weatherAlerts: true,
              institutionalUpdates: false,
            }
          }
          if (!parsed.organizationSubscriptions) {
            parsed.organizationSubscriptions = parsed.mediaPreferences ?? []
          }
          if (!parsed.mediaPreferences) parsed.mediaPreferences = parsed.organizationSubscriptions
          setUser(parsed)
          setOnboarding((prev) => ({ ...prev, isComplete: true }))
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
  }, [onboarding])

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setUser(updated)
  }, [user])

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
        signIn,
        signUp,
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
