'use client'

import { useActionState } from 'react'
import { sendWebLead, type LeadState } from '@/app/actions/lead'

interface Props {
  type: string
  submitLabel: string
  askOrg?: boolean
  messagePlaceholder?: string
}

const INITIAL: LeadState = { status: 'idle' }

export function LeadForm({ type, submitLabel, askOrg = false, messagePlaceholder = 'Contanos qué necesitás (opcional)' }: Props) {
  const [state, action, pending] = useActionState(sendWebLead, INITIAL)

  if (state.status === 'ok') {
    return (
      <div className="card p-6 text-center">
        <h3 className="font-display font-bold text-xl text-foreground">¡Recibimos tu consulta!</h3>
        <p className="text-muted mt-2">Te escribimos por WhatsApp a la brevedad.</p>
      </div>
    )
  }

  return (
    <form action={action} className="card p-6 space-y-3">
      <input type="hidden" name="type" value={type} />
      <input name="name" required className="input" placeholder="Tu nombre" autoComplete="name" />
      <input name="phone" required className="input" placeholder="Tu WhatsApp (+595 9xx xxx xxx)" inputMode="tel" autoComplete="tel" />
      {askOrg && <input name="org" className="input" placeholder="Organización" autoComplete="organization" />}
      <textarea name="message" className="input min-h-[100px]" placeholder={messagePlaceholder} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.status === 'error' && <p className="text-danger text-sm">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base">
        {pending ? 'Enviando…' : submitLabel}
      </button>
    </form>
  )
}
