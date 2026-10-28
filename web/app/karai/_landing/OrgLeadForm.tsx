'use client'

import { useActionState } from 'react'
import { ORG_TYPES } from '@/lib/karai/landing-content'
import { requestKaraiOrganization, type OrgLeadState } from './actions'

const INITIAL: OrgLeadState = { status: 'idle' }

const inputClass =
  'w-full bg-[var(--k-bg)] border border-[var(--k-border-strong)] rounded-xl px-3.5 py-3 text-[var(--k-text)] text-sm font-medium outline-none transition-colors focus:border-[var(--k-lime)] placeholder:text-[var(--k-muted-3)]'

export function OrgLeadForm() {
  const [state, action, pending] = useActionState(requestKaraiOrganization, INITIAL)

  if (state.status === 'ok') {
    return (
      <div className="bg-[var(--k-card)] border border-[var(--k-lime-border)] rounded-[20px] p-6 text-center">
        <p className="text-lg font-extrabold text-[var(--k-text)]">¡Gracias! Recibimos tu pedido.</p>
        <p className="text-sm font-medium text-[var(--k-muted)] mt-2">Te escribimos por WhatsApp para coordinar una reunión.</p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3 bg-[var(--k-card)] border border-[var(--k-border-strong)] rounded-[20px] p-5 sm:p-6">
      <input name="name" required className={inputClass} placeholder="Tu nombre" autoComplete="name" aria-label="Tu nombre" />
      <input name="organization" required className={inputClass} placeholder="Nombre de la organización" aria-label="Nombre de la organización" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="orgType" defaultValue="" className={inputClass} aria-label="Tipo de organización">
          <option value="" disabled>Tipo de organización</option>
          {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input name="role" className={inputClass} placeholder="Tu cargo (opcional)" aria-label="Tu cargo" />
      </div>
      <input name="phone" required className={inputClass} placeholder="WhatsApp (+595 9xx xxx xxx)" inputMode="tel" autoComplete="tel" aria-label="WhatsApp" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.status === 'error' && <p className="text-[var(--k-negative)] text-sm">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] text-[var(--k-on-lime)] rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-60"
      >
        {pending ? 'Enviando…' : 'Quiero sumar a mi organización'}
      </button>
    </form>
  )
}
