'use client'

import { useKaraiTheme } from './KaraiThemeProvider'

export function KaraiThemeToggle() {
  const { theme, toggle } = useKaraiTheme()

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="w-9 h-9 shrink-0 flex items-center justify-center bg-[var(--k-card)] border border-[var(--k-border-strong)] hover:border-[var(--k-border-hover)] text-[var(--k-muted)] hover:text-[var(--k-text)] rounded-[10px] text-sm transition-colors"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
