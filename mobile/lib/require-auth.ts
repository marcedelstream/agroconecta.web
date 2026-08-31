import { useCallback } from 'react'
import { router } from 'expo-router'
import { useApp } from './app-context'

// Gate para acciones de cuenta (guardar, suscribirse, publicar, recordatorios) en pantallas
// que ahora son navegables como invitado. Si no hay sesión, manda a login en vez de ejecutar
// la acción — evita repetir el mismo `if (!session) router.push(...)` en cada handler.
export function useRequireAuth() {
  const { session } = useApp()
  return useCallback(() => {
    if (session) return true
    router.push('/(auth)/login')
    return false
  }, [session])
}
