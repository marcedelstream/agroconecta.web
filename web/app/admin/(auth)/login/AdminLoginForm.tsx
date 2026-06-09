'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

function getInitialError(value: string | null) {
  if (value === 'unauthorized') return 'Tu usuario no tiene acceso de Agroconecta al panel.'
  if (value === 'verification') return 'No se pudo verificar el correo. Volvé a abrir el enlace o solicitá uno nuevo.'
  return null
}

export function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/admin'
  const urlError = params.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(getInitialError(urlError))
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createSupabaseBrowser()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      const message = authError.message.toLowerCase()
      setError(
        message.includes('email not confirmed')
          ? 'Tu correo todavía no está verificado. Abrí el enlace que te llegó por email antes de ingresar.'
          : 'Credenciales incorrectas. Verificá tu email y contraseña.'
      )
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo width={140} height={40} className="h-9 w-auto" />
          </div>
          <h1 className="font-display font-semibold text-xl text-foreground">Panel Agroconecta</h1>
          <p className="text-muted text-sm mt-1">Ingresá con tu cuenta autorizada</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-muted">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-muted">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
            {loading ? 'Ingresando...' : 'Ingresar al panel'}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Solo usuarios de Agroconecta pueden ingresar.
        </p>
      </div>
    </div>
  )
}
