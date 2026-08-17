'use client'

import { useActionState } from 'react'
import { activateMembershipByEmail, type MembershipActionState } from './actions'

const initialState: MembershipActionState = { error: null, success: null }

export function MembershipQuickForm() {
  const [state, formAction, isPending] = useActionState(activateMembershipByEmail, initialState)

  return (
    <form action={formAction} className="card flex flex-wrap items-end gap-3 mb-6">
      <div className="flex-1 min-w-[240px]">
        <label className="block text-sm font-medium text-foreground mb-1.5">Activar membresía por email</label>
        <input
          name="email"
          type="email"
          required
          className="input"
          placeholder="usuario@ejemplo.com"
        />
        <p className="text-xs text-muted mt-1">Para altas que se confirmaron por fuera de un pedido de la app.</p>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary text-sm">
        {isPending ? 'Activando...' : 'Activar membresía'}
      </button>
      {state.error && <p className="text-danger text-sm w-full">{state.error}</p>}
      {state.success && <p className="text-success text-sm w-full">{state.success}</p>}
    </form>
  )
}
