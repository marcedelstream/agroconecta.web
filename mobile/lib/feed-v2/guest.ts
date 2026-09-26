import { router } from 'expo-router'
import { currentUserId } from './api'
import { showToast } from './toast'

export const GUEST_TEXT = {
  needLogin: 'Iniciá sesión para hacer esto',
} as const

/**
 * Modo invitado (Apple 5.1.1(v)): se ve todo el contenido sin cuenta, y la cuenta se pide recién en
 * las acciones que la necesitan (me gusta, guardar, seguir, recordatorios, Karai, puntos).
 * Devuelve true si hay sesión; si no, avisa y manda a iniciar sesión.
 */
export async function requireSession(): Promise<boolean> {
  if (await currentUserId()) return true
  showToast(GUEST_TEXT.needLogin)
  router.push('/(auth)/login')
  return false
}
