import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/colors'
import type { AppTheme } from './types'

const THEME_KEY = '@agroconecta:theme'

interface ThemeContextType {
  theme: AppTheme
  setTheme: (t: AppTheme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ColorPalette {
  background: string
  surface: string
  secondary: string
  foreground: string
  muted: string
  border: string
  lime: string
  limeDark: string
  destructive: string
  success: string
  warning: string
  info: string
  overlay: string
  category: typeof Colors.category
  ecosystem: typeof Colors.ecosystem
}

export const DarkPalette: ColorPalette = {
  background: Colors.background,
  surface: Colors.surface,
  secondary: Colors.secondary,
  foreground: Colors.foreground,
  muted: Colors.muted,
  border: Colors.border,
  lime: Colors.lime,
  limeDark: Colors.limeDark,
  destructive: Colors.destructive,
  success: Colors.success,
  warning: Colors.warning,
  info: Colors.info,
  overlay: Colors.overlay,
  category: Colors.category,
  ecosystem: Colors.ecosystem,
}

export const LightPalette = {
  ...DarkPalette,
  background: Colors.light.background,
  surface: Colors.light.surface,
  secondary: Colors.light.secondary,
  foreground: Colors.light.foreground,
  muted: Colors.light.muted,
  border: Colors.light.border,
  lime: Colors.light.lime,
  limeDark: Colors.limeDark,
} satisfies ColorPalette

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('dark')

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') setThemeState(stored)
    })
  }, [])

  const setTheme = useCallback(async (t: AppTheme) => {
    setThemeState(t)
    await AsyncStorage.setItem(THEME_KEY, t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function useColors(): ColorPalette {
  const { isDark } = useTheme()
  return isDark ? DarkPalette : LightPalette
}
