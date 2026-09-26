import {
  fetchEcosystemListingById,
  fetchEventBySlug,
  fetchPublishedPostBySlug,
} from '@/lib/supabase-repositories'
import type { FeedContentItem } from './types'

// Lo que la ficha "Ver …" necesita además de lo que ya trae el item del feed. Se reutilizan los
// repositorios de la v1 (misma fuente de verdad que las pantallas de detalle viejas).

export type DetailLink =
  | { kind: 'route'; href: string }
  | { kind: 'url'; url: string }

export interface FeedDetail {
  /** HTML del cuerpo (noticias); si no hay, se usa `bodyText`. */
  bodyHtml: string | null
  bodyText: string
  /** "Sáb 12 de octubre · 08:00" — solo eventos y remates. */
  when: string | null
  place: string | null
  secondaryLink: DetailLink | null
}

function formatWhen(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'long' })
  const time = d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${time}`
}

export async function loadFeedDetail(item: FeedContentItem): Promise<FeedDetail> {
  const base: FeedDetail = {
    bodyHtml: null,
    bodyText: item.summary,
    when: item.contentType === 'evento' || item.contentType === 'remate' ? formatWhen(item.startsAt) : null,
    place: item.location,
    secondaryLink: null,
  }

  if (item.source === 'post') {
    const post = await fetchPublishedPostBySlug(item.sourceId)
    return {
      ...base,
      bodyHtml: post?.content || null,
      // El video completo (y el recordatorio de remate de la v1) siguen en su pantalla propia.
      secondaryLink: item.youtubeUrl ? { kind: 'route', href: `/(main)/video/${item.sourceId}` } : null,
    }
  }

  if (item.source === 'event') {
    const event = await fetchEventBySlug(item.sourceId)
    return {
      ...base,
      bodyText: event?.longDescription || event?.description || item.summary,
      // El hub del evento (programa + noticias) es la vista completa (README §2).
      secondaryLink: { kind: 'route', href: `/(main)/event/${item.sourceId}` },
    }
  }

  const listing = await fetchEcosystemListingById(item.sourceId)
  return {
    ...base,
    bodyText: listing?.description || item.summary,
    place: listing ? `${listing.location} · ${listing.modality}` : base.place,
    secondaryLink: listing?.contactUrl ? { kind: 'url', url: listing.contactUrl } : null,
  }
}
