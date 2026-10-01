import { redirect } from 'next/navigation'

// Después de una acción del panel se vuelve a la misma pantalla con ?ok= o ?error=, y <Notice> lo
// muestra en verde o rojo. Reemplaza al `throw new Error` que terminaba en la página de error genérica.

// La ruta puede venir con su propio filtro (ej. ?tipo=rubro): el aviso se suma con & en ese caso.
const join = (path: string) => (path.includes('?') ? '&' : '?')

export function backWithOk(path: string, message: string): never {
  redirect(`${path}${join(path)}ok=${encodeURIComponent(message)}`)
}

export function backWithError(path: string, message: string): never {
  redirect(`${path}${join(path)}error=${encodeURIComponent(message)}`)
}

export interface FeedbackParams {
  ok?: string
  error?: string
}
