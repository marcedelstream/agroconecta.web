import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getLocalAvatarUri } from './local-avatar'

interface LocalAvatarContextValue {
  avatarUri: string | null
  setAvatarUri: (uri: string | null) => void
  refreshAvatar: () => Promise<void>
}

const LocalAvatarContext = createContext<LocalAvatarContextValue | null>(null)

// Foto de perfil local compartida — un solo lugar de verdad para que cualquier "globito"
// de perfil (HeaderAvatar, el ítem "Ver perfil" del menú, la propia pantalla de Perfil) la
// muestre siempre, y se actualice en todos a la vez apenas el usuario la cambia o la saca.
export function LocalAvatarProvider({ children }: { children: ReactNode }) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null)

  const refreshAvatar = useCallback(async () => {
    const uri = await getLocalAvatarUri()
    setAvatarUri(uri)
  }, [])

  useEffect(() => {
    refreshAvatar()
  }, [refreshAvatar])

  return (
    <LocalAvatarContext.Provider value={{ avatarUri, setAvatarUri, refreshAvatar }}>
      {children}
    </LocalAvatarContext.Provider>
  )
}

export function useLocalAvatar(): LocalAvatarContextValue {
  const ctx = useContext(LocalAvatarContext)
  if (!ctx) throw new Error('useLocalAvatar debe usarse dentro de LocalAvatarProvider')
  return ctx
}
