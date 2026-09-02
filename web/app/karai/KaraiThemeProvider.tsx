'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type KaraiTheme = 'dark' | 'light'

interface KaraiThemeCtx {
  theme: KaraiTheme
  toggle: () => void
}

const STORAGE_KEY = 'karai-theme'

const Ctx = createContext<KaraiThemeCtx>({ theme: 'dark', toggle: () => {} })

// Propio de Karai, independiente del ThemeProvider del sitio (que setea data-theme en <html> con
// su propia localStorage key) — Karai arranca siempre oscuro salvo que el usuario haya elegido
// claro en este subdominio antes.
export function KaraiThemeProvider({ className, children }: { className: string; children: React.ReactNode }) {
  const [theme, setTheme] = useState<KaraiTheme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as KaraiTheme | null
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  function toggle() {
    const next: KaraiTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      <div className={className} data-k-theme={theme}>
        {children}
      </div>
    </Ctx.Provider>
  )
}

export function useKaraiTheme() {
  return useContext(Ctx)
}
