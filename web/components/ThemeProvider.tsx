'use client'

import { useEffect } from 'react'

// La web oficial (2026-09) es solo tema claro, igual que la app v2. Se limpia la preferencia "oscuro"
// que pudo quedar guardada de la web anterior. Karai tiene su propio tema (KaraiThemeProvider).
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    try {
      localStorage.removeItem('agro-theme')
    } catch {
      // sin almacenamiento disponible: no hay nada que limpiar
    }
  }, [])
  return <>{children}</>
}
