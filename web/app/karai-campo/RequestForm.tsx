'use client'

import { useActionState } from 'react'
import { requestKaraiCampo, type RequestState } from './actions'

const INITIAL: RequestState = { status: 'idle' }

export function RequestForm() {
  const [state, action, pending] = useActionState(requestKaraiCampo, INITIAL)

  if (state.status === 'ok') {
    return (
      <div className="card p-6 text-center">
        <h3 className="font-display font-semibold text-xl text-foreground">¡Recibimos tu pedido!</h3>
        <p className="text-muted text-sm mt-2">Te escribimos por WhatsApp para activar tu KARAI Campo.</p>
      </div>
    )
  }

  return (
    <form action={action} className="card p-6 space-y-3">
      <input name="name" required className="input" placeholder="Tu nombre" autoComplete="name" />
      <input name="phone" required className="input" placeholder="Tu WhatsApp (+595 9xx xxx xxx)" inputMode="tel" autoComplete="tel" />
      <input name="email" type="email" className="input" placeholder="Correo de tu cuenta en la app (opcional)" autoComplete="email" />
      <input name="place" className="input" placeholder="Establecimiento o zona (opcional)" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.status === 'error' && <p className="text-danger text-sm">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Enviando…' : 'Quiero KARAI Campo'}
      </button>
      <p className="text-xs text-muted">Te contactamos para activarlo en tu cuenta. Sin compromiso.</p>
    </form>
  )
}
