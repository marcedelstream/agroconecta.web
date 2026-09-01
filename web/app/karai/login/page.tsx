import { Suspense } from 'react'
import type { Metadata } from 'next'
import { KaraiLoginForm } from './KaraiLoginForm'

export const metadata: Metadata = {
  title: 'Ingresar — Karai',
}

export default function KaraiLoginPage() {
  return (
    <Suspense fallback={null}>
      <KaraiLoginForm />
    </Suspense>
  )
}
