import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Department, NewsCategory, NotificationPreferences, OnboardingState, Profession, UserProfile } from './types'

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

  // ¡Ojo! `is_member` a propósito NO va en este upsert: es un flag de privilegio que solo
  // el equipo activa a mano desde Supabase Studio. Si se agrega acá, cualquier cliente podría
  // otorgarse membresía llamando updateUser({ isMember: true }) — se lee (hydrateProfileFromSupabase
  // / refreshMembership) pero nunca se escribe desde el dispositivo del usuario.
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: profile.id,
    name: profile.name,
    email: profile.email ?? null,
    phone: profile.phone ?? null,
    profession: profile.profession,
    department: profile.department,
    notification_prefs: profile.notificationPrefs,
    section_order: profile.sectionOrder ?? null,
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

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  breakingNews: true,
  priceAlerts: true,
  weatherAlerts: true,
  institutionalUpdates: false,
}

// Se usa cuando no hay perfil cacheado en este dispositivo para la cuenta que acaba de iniciar
// sesion (reinstalacion, dispositivo nuevo, cache borrado) — antes de mandar a onboarding, nos
// fijamos si esa cuenta ya completo el onboarding antes desde otro dispositivo.
async function hydrateProfileFromSupabase(authId: string): Promise<UserProfile | null> {
  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, email, phone, profession, department, notification_prefs, section_order, is_member, created_at')
    .eq('id', authId)
    .maybeSingle()

  if (profileError || !profileRow) return null

  const [{ data: interestRows }, { data: subscriptionRows }] = await Promise.all([
    supabase.from('user_interests').select('category').eq('user_id', authId),
    supabase.from('user_subscriptions').select('organization_id').eq('user_id', authId),
  ])

  const organizationIds = (subscriptionRows ?? []).map((row) => row.organization_id as string)

  return {
    id: profileRow.id,
    name: profileRow.name,
    email: profileRow.email ?? undefined,
    phone: profileRow.phone ?? undefined,
    profession: profileRow.profession as Profession,
    department: profileRow.department as Department,
    preferences: (interestRows ?? []).map((row) => row.category as NewsCategory),
    organizationSubscriptions: organizationIds,
    mediaPreferences: organizationIds,
    notificationPrefs: (profileRow.notification_prefs as NotificationPreferences | null) ?? DEFAULT_NOTIFICATION_PREFS,
    sectionOrder: (profileRow.section_order as string[] | null) ?? undefined,
    isMember: (profileRow.is_member as boolean | null) ?? false,
    createdAt: new Date(profileRow.created_at),
  }
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
  deleteAccount: () => Promise<string | null>
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

  // El perfil cacheado en el dispositivo puede tener `isMember` desactualizado si el equipo
  // activó la membresía desde Supabase Studio después del último login — no hay push para
  // eso, así que lo refrescamos en silencio al abrir la app.
  useEffect(() => {
    if (!user?.id || !validUuid(user.id)) return
    const userId = user.id
    ;(async () => {
      try {
        const { data } = await supabase.from('profiles').select('is_member').eq('id', userId).maybeSingle()
        if (!data || typeof data.is_member !== 'boolean' || data.is_member === user?.isMember) return
        setUser((prev) => {
          if (!prev) return prev
          const updated = { ...prev, isMember: data.is_member }
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {})
          return updated
        })
      } catch {
        // Sin conexión o error puntual — se reintenta en el próximo mount.
      }
    })()
    // Solo cuando cambia de usuario — no queremos refetchear en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

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

    const remote = await hydrateProfileFromSupabase(authId)
    if (remote) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
      setUser(remote)
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

  const deleteAccount = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return 'No hay una sesión activa.'

    try {
      // El token va en el header Y en el body: si algún redirect de dominio en el camino
      // pisa el header Authorization, el body de un POST igual sobrevive. Timeout propio:
      // fetch no tiene uno por defecto — si el server nunca responde, la promesa quedaba
      // colgada para siempre (ni resuelve ni rechaza, así que ningún try/catch la agarra).
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      let res: Response
      try {
        res = await fetch('https://agroconecta.com.py/api/delete-account', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeout)
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        return body?.error ?? `No se pudo eliminar la cuenta (${res.status}).`
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'El servidor no respondió a tiempo. Probá de nuevo en unos minutos.'
      }
      return err instanceof Error ? err.message : 'No se pudo eliminar la cuenta.'
    }

    // La cuenta ya se borró en el servidor acá arriba (irreversible) — de acá en más todo
    // es limpieza local best-effort. signOut() le pide al servidor revocar la sesión de un
    // usuario que ya no existe, y en vez de fallar rápido puede quedarse reintentando sin
    // resolver nunca (por eso el try/catch de más arriba no alcanzaba) — scope:'local' evita
    // el viaje al servidor directamente, y el timeout es un piso de seguridad extra.
    try {
      await AsyncStorage.removeItem(STORAGE_KEY)
    } catch {
      // best-effort
    }
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ])
    } catch {
      // best-effort — la cuenta ya no existe, puede que el propio signOut falle o cuelgue
    }
    setUser(null)
    setOnboarding(initialOnboarding)
    return null
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
        deleteAccount,
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
