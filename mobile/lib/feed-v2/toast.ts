import { useEffect, useState } from 'react'

// Aviso breve arriba para confirmar una acción (README §6: "aviso breve (toast) arriba"). Emisor de
// módulo en vez de contexto: se puede disparar desde cualquier lado y el ToastHost que esté montado
// (el del feed o el de la ficha, que vive en su propio Modal) lo muestra.

const DURATION_MS = 2200
type Listener = (message: string | null) => void
const listeners = new Set<Listener>()
let timer: ReturnType<typeof setTimeout> | null = null

export function showToast(message: string) {
  if (timer) clearTimeout(timer)
  listeners.forEach((l) => l(message))
  timer = setTimeout(() => listeners.forEach((l) => l(null)), DURATION_MS)
}

export function useToastMessage(): string | null {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    listeners.add(setMessage)
    return () => {
      listeners.delete(setMessage)
    }
  }, [])
  return message
}
