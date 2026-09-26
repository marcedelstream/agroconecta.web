'use client'

import { useRef } from 'react'
import { Help } from '@/components/admin/ui'
import { markRedemptionUsed } from './actions'

// Marcar un código como usado no tiene vuelta atrás: se confirma antes de mandar, mostrando el código.
export function ValidateCodeForm() {
  const input = useRef<HTMLInputElement>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const code = input.current?.value.trim().toUpperCase() ?? ''
    if (!code || !window.confirm(`¿Marcar el código ${code} como usado?\n\nHacelo solo si el aliado ya entregó el premio. No se puede deshacer.`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={markRedemptionUsed} onSubmit={onSubmit} className="card flex flex-wrap items-center gap-3 mb-6">
      <span className="text-sm font-semibold text-foreground">
        Validar código
        <Help text="Cuando el aliado te pase un código AGRO-XXXX, escribilo acá. Una vez marcado como usado no se puede volver atrás." />
      </span>
      <input ref={input} name="code" required className="input max-w-[200px] uppercase" placeholder="AGRO-XXXX" autoComplete="off" />
      <button type="submit" className="btn-primary text-sm">Marcar como usado</button>
    </form>
  )
}
