'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function KaraiSplash() {
  const [state, setState] = useState<'visible' | 'fading' | 'gone'>('visible')

  useEffect(() => {
    if (sessionStorage.getItem('karai-splash-shown')) {
      setState('gone')
      return
    }

    const fadeTimer = setTimeout(() => setState('fading'), 1400)
    const hideTimer = setTimeout(() => {
      setState('gone')
      sessionStorage.setItem('karai-splash-shown', '1')
    }, 1900)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (state === 'gone') return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[var(--k-bg)] flex flex-col items-center justify-center gap-4
                  transition-opacity duration-500 ${state === 'fading' ? 'opacity-0' : 'opacity-100'}`}
    >
      <Image src="/karai-avatar.png" alt="Karai" width={64} height={64} className="rounded-[20px] block" priority />
      <div className="flex flex-col items-center gap-1">
        <p className="text-[17px] font-extrabold tracking-[-0.01em] text-[var(--k-text)]">Karai</p>
        <p className="text-[13px] font-medium text-[var(--k-muted-2)]">IA oficial del agro paraguayo</p>
      </div>
      <div className="mt-4 w-32 h-[3px] bg-[var(--k-border-strong)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--k-lime)] rounded-full animate-load-bar" />
      </div>
    </div>
  )
}
