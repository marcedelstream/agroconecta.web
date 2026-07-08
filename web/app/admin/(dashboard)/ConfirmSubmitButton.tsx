'use client'

import { useTransition } from 'react'

interface Props {
  action: (formData: FormData) => Promise<void | unknown> | void
  fields: Record<string, string>
  confirmMessage: string
  label?: string
  pendingLabel?: string
  className?: string
}

// Los Server Components no pueden tener onSubmit propio (React tira "Event handlers
// cannot be passed to Client Component props" en runtime, aunque el build compile bien).
// Este botón invoca la server action directo desde un Client Component chico.
export function ConfirmSubmitButton({
  action, fields, confirmMessage, label = 'Eliminar', pendingLabel = 'Procesando...', className,
}: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(confirmMessage)) return
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(fields).forEach(([key, value]) => formData.set(key, value))
      await action(formData)
    })
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={className}>
      {isPending ? pendingLabel : label}
    </button>
  )
}
