'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from './ThemeProvider'

export function SplashScreen() {
  const [state, setState] = useState<'visible' | 'fading' | 'gone'>('visible')
  const { theme } = useTheme()
  const logoSrc = theme === 'light' ? '/logo-light.png' : '/logo-dark.png'

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/karai')) {
      setState('gone')
      return
    }
    if (sessionStorage.getItem('splash-shown')) {
      setState('gone')
      return
    }

    const fadeTimer = setTimeout(() => setState('fading'), 1800)
    const hideTimer = setTimeout(() => {
      setState('gone')
      sessionStorage.setItem('splash-shown', '1')
    }, 2300)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (state === 'gone') return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center
                  transition-opacity duration-500 ${state === 'fading' ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="animate-fade-up">
        <Image
          src={logoSrc}
          alt="Agroconecta"
          width={180}
          height={54}
          priority
          className="h-12 w-auto"
        />
      </div>

      <p className="text-muted text-sm mt-3 animate-fade-up" style={{ animationDelay: '150ms', opacity: 0 }}>
        Noticias agropecuarias del Paraguay
      </p>

      <div className="mt-10 w-40 h-0.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-lime rounded-full animate-load-bar" />
      </div>
    </div>
  )
}
