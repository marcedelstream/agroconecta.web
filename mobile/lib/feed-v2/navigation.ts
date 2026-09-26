import { router } from 'expo-router'
import { trackFeedEvent } from './telemetry'
import type { FeedContentItem } from './types'

// Destino del botón de acción. Provisorio hasta la ficha v2 (DetailSheet, bloque 1d): por ahora
// abre las pantallas de detalle que ya existen en la v1.
export function openFeedItem(item: FeedContentItem) {
  trackFeedEvent(item.source, item.sourceId, 'cta_open')
  switch (item.source) {
    case 'event':
      router.push(`/(main)/event/${item.sourceId}` as never)
      return
    case 'listing':
      router.push(`/(main)/listing/${item.sourceId}` as never)
      return
    case 'post':
      if (item.youtubeUrl) router.push(`/(main)/video/${item.sourceId}` as never)
      else router.push(`/(main)/article/${item.sourceId}` as never)
  }
}

export function openPublisher(item: FeedContentItem) {
  if (item.source === 'post' && item.organizationId) {
    router.push(`/(main)/publisher/${item.organizationId}` as never)
  }
}
