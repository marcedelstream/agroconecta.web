// Lectura de una nota de un medio externo para el importador del panel (/admin/publicaciones/importar).
// Sin dependencias a propósito: los medios agro paraguayos usan HTML bastante simple (Next/WordPress),
// alcanza con buscar el contenedor de la nota y recorrer sus bloques en orden. Si un medio no encaja,
// el editor igual puede corregir a mano en el formulario antes de guardar.

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'li'; text: string }

export interface ExtractedArticle {
  url: string
  title: string
  description: string
  imageUrl: string | null
  siteName: string
  section: string | null
  publishedAt: string | null
  blocks: ArticleBlock[]
}

// A partir de estos títulos empieza lo que no es la nota (relacionadas, comentarios, etc.).
const END_OF_ARTICLE = /^(noticias relacionadas|te puede interesar|m[aá]s noticias|le[eé] tambi[eé]n|tambi[eé]n te puede|comentarios|etiquetas|compartir)/i
const BOILERPLATE = /^(fecha de publicaci[oó]n|publicado( el)?|compartir|compart[ií] esta nota|seguinos|suscribite|foto:|fuente:)/i
const DATE_ONLY = /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  ndash: '–', mdash: '—', hellip: '…', iexcl: '¡', iquest: '¿', ordm: 'º', ordf: 'ª', deg: '°',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', Uuml: 'Ü',
}

export function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const num = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(num) ? String.fromCodePoint(num) : match
    }
    return NAMED_ENTITIES[code] ?? match
  })
}

function cleanText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''))
    .replace(/[​-‍﻿]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return cleanText(match[1])
  }
  return null
}

interface JsonLdArticle {
  headline?: string
  description?: string
  image?: string | string[] | { url?: string }
  datePublished?: string
  articleSection?: string | string[]
}

function findJsonLdArticle(html: string): JsonLdArticle | null {
  for (const match of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed: unknown = JSON.parse(match[1])
      const candidates = Array.isArray(parsed)
        ? parsed
        : (parsed as { '@graph'?: unknown[] })['@graph'] ?? [parsed]
      for (const item of candidates) {
        const type = (item as { '@type'?: string | string[] })['@type']
        const types = Array.isArray(type) ? type : [type]
        if (types.some((t) => t === 'NewsArticle' || t === 'Article' || t === 'BlogPosting')) {
          return item as JsonLdArticle
        }
      }
    } catch {
      // JSON-LD roto en el medio: se sigue con las meta tags.
    }
  }
  return null
}

function jsonLdImage(image: JsonLdArticle['image']): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  if (Array.isArray(image)) return image[0] ?? null
  return image.url ?? null
}

// El sufijo " | Nombre del medio" que muchos sitios agregan al <title>/og:title.
function stripSiteSuffix(title: string, siteName: string): string {
  const parts = title.split(/\s+[|–—-]\s+/)
  if (parts.length > 1 && siteName && parts[parts.length - 1].toLowerCase().includes(siteName.toLowerCase().slice(0, 12))) {
    return parts.slice(0, -1).join(' - ').trim()
  }
  return title.trim()
}

function stripNoise(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|svg|nav|aside|form|footer|figure|iframe|button)\b[\s\S]*?<\/\1>/gi, '')
}

function paragraphLength(html: string): number {
  let total = 0
  for (const match of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) total += cleanText(match[1]).length
  return total
}

// Se queda con el <article>/<main> que más texto de párrafos tiene; si no hay ninguno, todo el body.
function pickContainer(html: string): string {
  const candidates: string[] = []
  for (const tag of ['article', 'main']) {
    const openRe = new RegExp(`<${tag}\\b[^>]*>`, 'gi')
    for (const open of html.matchAll(openRe)) {
      const start = (open.index ?? 0) + open[0].length
      const end = html.indexOf(`</${tag}>`, start)
      candidates.push(html.slice(start, end === -1 ? undefined : end))
    }
  }
  const best = candidates.sort((a, b) => paragraphLength(b) - paragraphLength(a))[0]
  if (best && paragraphLength(best) > 200) return best
  const body = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)
  return body?.[1] ?? html
}

function looksLikeSubtitle(text: string): boolean {
  return text.length <= 90 && !/[.:;,]$/.test(text) && /^[A-ZÁÉÍÓÚÑ¿¡"“]/.test(text)
}

export function extractBlocks(containerHtml: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = []
  const blockRe = /<(p|h[2-4]|blockquote|li)\b[^>]*>([\s\S]*?)<\/\1>/gi

  for (const match of stripNoise(containerHtml).matchAll(blockRe)) {
    const tag = match[1].toLowerCase()
    let text = cleanText(match[2])
    if (!text) continue
    if (tag !== 'p' && END_OF_ARTICLE.test(text)) break
    if (END_OF_ARTICLE.test(text) && text.length < 40) break
    if (BOILERPLATE.test(text) || DATE_ONLY.test(text)) continue

    // Algunos CMS arman las viñetas como párrafos que empiezan con "- " o ". - ".
    const bullet = text.match(/^[.·•*-]\s*[-–]?\s*(.+)$/)
    if (tag === 'li' || (bullet && tag === 'p')) {
      text = bullet ? bullet[1].trim() : text
      if (text) blocks.push({ type: 'li', text })
      continue
    }
    if (tag === 'blockquote') {
      blocks.push({ type: 'quote', text })
      continue
    }
    if (tag.startsWith('h') || looksLikeSubtitle(text)) {
      blocks.push({ type: 'h2', text })
      continue
    }
    blocks.push({ type: 'p', text })
  }

  // Un "subtítulo" al final o dos seguidos casi siempre es ruido (firma, crédito, pie de foto).
  while (blocks.length && blocks[blocks.length - 1].type === 'h2') blocks.pop()
  return blocks
}

export function parseArticle(html: string, url: string): ExtractedArticle {
  const ld = findJsonLdArticle(html)
  const siteName = metaContent(html, 'og:site_name') ?? new URL(url).hostname.replace(/^www\./, '')
  const rawTitle = ld?.headline ?? metaContent(html, 'og:title') ?? cleanText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const section = Array.isArray(ld?.articleSection) ? ld?.articleSection[0] : ld?.articleSection

  return {
    url,
    title: stripSiteSuffix(decodeEntities(rawTitle), siteName),
    description: decodeEntities(ld?.description ?? metaContent(html, 'og:description') ?? metaContent(html, 'description') ?? ''),
    imageUrl: metaContent(html, 'og:image') ?? jsonLdImage(ld?.image),
    siteName,
    section: section ?? metaContent(html, 'article:section'),
    publishedAt: ld?.datePublished ?? metaContent(html, 'article:published_time'),
    blocks: extractBlocks(pickContainer(html)),
  }
}

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i

export async function fetchArticle(rawUrl: string): Promise<ExtractedArticle> {
  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    throw new Error('El link no es válido. Copiá la dirección completa (con https://).')
  }
  if (!/^https?:$/.test(url.protocol) || PRIVATE_HOST.test(url.hostname)) {
    throw new Error('Solo se pueden importar notas de sitios públicos (http/https).')
  }

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AgroconectaBot/1.0; +https://agroconecta.com.py)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  }).catch(() => null)

  if (!res) throw new Error('No se pudo abrir el link (el sitio no respondió a tiempo).')
  if (!res.ok) throw new Error(`El sitio respondió con error ${res.status}. Probá abrir el link en el navegador.`)

  const html = await res.text()
  const article = parseArticle(html, res.url || url.toString())
  if (!article.title || article.blocks.length === 0) {
    throw new Error('No se encontró el texto de la nota en esa página. Puede que el sitio la cargue de otra forma; cargala a mano.')
  }
  return article
}
