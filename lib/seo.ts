import type { PostRow } from './types'

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://agroconecta.com.py').replace(/\/$/, '')

export function absoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateMeta(value: string, maxLength = 160) {
  const clean = stripHtml(value)
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength - 1).trim()}…`
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function postSlug(post: Pick<PostRow, 'id' | 'title'>) {
  const slug = slugify(post.title) || 'noticia'
  return `${slug}-${post.id}`
}

export function postPath(post: Pick<PostRow, 'id' | 'title'>) {
  return `/noticias/${postSlug(post)}`
}

export function postUrl(post: Pick<PostRow, 'id' | 'title'>) {
  return absoluteUrl(postPath(post))
}

export function extractPostId(slugOrId: string) {
  const match = slugOrId.match(UUID_PATTERN)
  return match?.[0] ?? slugOrId
}
