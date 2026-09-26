import { useCallback, useMemo, useState } from 'react'
import * as Haptics from 'expo-haptics'
import { setFollowing, setLiked, setSaved, shareItem } from './actions'
import { DETAIL_TEXT } from './labels'
import { trackFeedEvent } from './telemetry'
import { showToast } from './toast'
import type { FeedContentItem } from './types'

/** Aplica un cambio a todos los items de contenido de la lista de quien usa el hook. */
export type ItemUpdater = (fn: (item: FeedContentItem) => FeedContentItem) => void

// Me gusta, guardar, seguir, compartir y abrir la ficha. Lo comparten el feed y Explorar, cada uno
// con su propia lista: el cambio se pinta al instante y se revierte si la escritura en Supabase falla.
export function useItemActions(update: ItemUpdater) {
  const patch = useCallback(
    (key: string, change: Partial<FeedContentItem>) => update((i) => (i.key === key ? { ...i, ...change } : i)),
    [update],
  )

  const toggleLike = useCallback(
    async (item: FeedContentItem) => {
      const on = !item.liked
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null)
      patch(item.key, { liked: on, likes: item.likes + (on ? 1 : -1) })
      if (await setLiked(item, on)) {
        if (on) trackFeedEvent(item.source, item.sourceId, 'like')
      } else patch(item.key, { liked: item.liked, likes: item.likes })
    },
    [patch],
  )

  // Doble toque: solo marca. Si ya estaba marcado, alcanza con la vibración y el corazón.
  const likeOnce = useCallback(
    (item: FeedContentItem) => {
      if (item.liked) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null)
      else void toggleLike(item)
    },
    [toggleLike],
  )

  const toggleSave = useCallback(
    async (item: FeedContentItem) => {
      const on = !item.saved
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null)
      patch(item.key, { saved: on, saves: item.saves + (on ? 1 : -1) })
      if (await setSaved(item, on)) {
        if (on) trackFeedEvent(item.source, item.sourceId, 'save')
      } else patch(item.key, { saved: item.saved, saves: item.saves })
    },
    [patch],
  )

  // Desde la ficha: mismo guardado, con aviso (en el feed alcanza con el cambio del ícono).
  const toggleSaveWithToast = useCallback(
    async (item: FeedContentItem) => {
      showToast(item.saved ? DETAIL_TEXT.toastUnsaved : DETAIL_TEXT.toastSaved)
      await toggleSave(item)
    },
    [toggleSave],
  )

  // Seguir afecta a todos los items de la misma organización, no solo al visible.
  const toggleFollow = useCallback(
    async (item: FeedContentItem) => {
      const on = !item.following
      const apply = (value: boolean) =>
        update((i) => (i.organizationId === item.organizationId ? { ...i, following: value } : i))
      Haptics.selectionAsync().catch(() => null)
      apply(on)
      if (await setFollowing(item, on)) {
        if (on) trackFeedEvent(item.source, item.sourceId, 'follow')
      } else apply(item.following)
    },
    [update],
  )

  const share = useCallback(async (item: FeedContentItem) => {
    if (await shareItem(item)) trackFeedEvent(item.source, item.sourceId, 'share')
  }, [])

  // La ficha abierta se guarda por clave y quien usa el hook la busca en su lista: así refleja al
  // instante los cambios de me gusta/guardar/seguir hechos desde la propia ficha.
  const [detailKey, setDetailKey] = useState<string | null>(null)
  const openDetail = useCallback((item: FeedContentItem) => {
    trackFeedEvent(item.source, item.sourceId, 'cta_open')
    setDetailKey(item.key)
  }, [])
  const closeDetail = useCallback(() => setDetailKey(null), [])

  // Objeto estable: los slides son memo y no tienen que re-renderizarse cuando cambia otro item.
  const actions = useMemo(
    () => ({ toggleLike, likeOnce, toggleSave, toggleSaveWithToast, toggleFollow, share, openDetail }),
    [toggleLike, likeOnce, toggleSave, toggleSaveWithToast, toggleFollow, share, openDetail],
  )

  return { actions, detailKey, closeDetail }
}

export type FeedActions = ReturnType<typeof useItemActions>['actions']
