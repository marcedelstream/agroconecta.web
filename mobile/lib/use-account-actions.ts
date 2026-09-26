import { useState } from 'react'
import { router } from 'expo-router'
import { useApp } from './app-context'

// Cerrar sesión y eliminar cuenta (misma lógica que el Perfil v1), para el menú "Más" de la v2.
export function useAccountActions() {
  const { signOut, deleteAccount } = useApp()
  const [logoutVisible, setLogoutVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function confirmLogout() {
    setLogoutVisible(false)
    await signOut()
    router.replace('/(auth)/login')
  }

  async function confirmDelete() {
    if (deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const error = await deleteAccount()
      if (error) {
        setDeleteError(error)
        return
      }
      setDeleteVisible(false)
      router.replace('/(auth)/login')
    } catch (err) {
      // deleteAccount ya captura sus errores; esto evita que el botón quede trabado si algo se escapa.
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta.')
    } finally {
      setDeleting(false)
    }
  }

  return {
    logoutVisible,
    openLogout: () => setLogoutVisible(true),
    cancelLogout: () => setLogoutVisible(false),
    confirmLogout,
    deleteVisible,
    deleting,
    deleteError,
    openDelete: () => setDeleteVisible(true),
    cancelDelete: () => {
      setDeleteVisible(false)
      setDeleteError(null)
    },
    confirmDelete,
  }
}
