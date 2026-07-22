import { createHash } from 'node:crypto'
import { createSupabaseAdmin } from './supabase-admin'
import { slugify, stripHtml, truncateMeta } from './seo'
import type { EditorialStatus, NewsCategory } from './types'

type SourceType = 'wordpress' | 'rss' | 'html_og'
type RepublishPolicy = 'preview_only' | 'full_republish'

interface NewsSourceRow {
  id: string
  organization_id: string
  name: string
  site_url: string
  feed_url: string
  source_type: SourceType
  category: NewsCategory
  republish_policy: RepublishPolicy
  default_editorial_status: EditorialStatus
  max_items_per_run: number
}

interface SyndicatedItem {
  externalId: string
  title: string
  summary: string
  contentHtml: string
  imageUrl: string | null
  publishedAt: string | null
  canonicalUrl: string
}

interface WordPressRendered {
  rendered?: string
}

interface WordPressPost {
  id: number
  link?: string
  date_gmt?: string
  date?: string
  title?: WordPressRendered
  excerpt?: WordPressRendered
  content?: WordPressRendered
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string
      media_details?: {
        width?: number
        height?: number
        sizes?: Record<string, { source_url?: string; width?: number; height?: number }>
      }
    }>
  }
}

export interface SyndicationResult {
  sourceId: string
  sourceName: string
  checked: number
  imported: number
  skipped: number
  error: string | null
}

const FETCH_TIMEOUT_MS = 12000

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function contentHash(item: Pick<SyndicatedItem, 'title' | 'summary' | 'contentHtml'>) {
  return createHash('sha256')
    .update(`${item.title}\n${item.summary}\n${stripHtml(item.contentHtml)}`)
    .digest('hex')
}

async function fetchText(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/rss+xml,application/atom+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'AgroconectaBot/1.0 (+https://agroconecta.com.py)',
      },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchJson<T>(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'AgroconectaBot/1.0 (+https://agroconecta.com.py)',
      },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

function absolutizeUrl(url: string, baseUrl: string) {
  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return url
  }
}

function firstMatch(value: string, pattern: RegExp) {
  return pattern.exec(value)?.[1]?.trim() ?? ''
}

function extractTag(block: string, tag: string) {
  return decodeHtml(firstMatch(block, new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')))
}

function extractAttribute(block: string, tag: string, attr: string) {
  const tagMatch = new RegExp(`<${tag}[^>]*>`, 'i').exec(block)?.[0] ?? ''
  return firstMatch(tagMatch, new RegExp(`${attr}=["']([^"']+)["']`, 'i'))
}

function imageScore(url: string) {
  const lower = url.toLowerCase()
  let score = 0

  if (/\.(jpe?g|png|webp)(\?|$)/i.test(url)) score += 10
  if (lower.includes('full') || lower.includes('original')) score += 20
  if (lower.includes('large') || lower.includes('xl')) score += 10
  if (lower.includes('thumb') || lower.includes('thumbnail') || lower.includes('cropped')) score -= 30
  if (lower.includes('logo') || lower.includes('avatar') || lower.includes('icon')) score -= 40

  const dimensions = Array.from(url.matchAll(/(?:-|_)(\d{2,5})x(\d{2,5})(?=[._?/-])/g))
  for (const match of dimensions) {
    const width = Number(match[1])
    const height = Number(match[2])
    if (Number.isFinite(width) && Number.isFinite(height)) score += Math.min(width * height / 10000, 120)
  }

  return score
}

function bestImageUrl(candidates: Array<string | null | undefined>, baseUrl: string) {
  const seen = new Set<string>()
  const normalized = candidates
    .filter((candidate): candidate is string => Boolean(candidate))
    .map((candidate) => absolutizeUrl(decodeHtml(candidate), baseUrl))
    .filter((candidate) => {
      if (!candidate || seen.has(candidate)) return false
      seen.add(candidate)
      return true
    })

  normalized.sort((a, b) => imageScore(b) - imageScore(a))
  return normalized[0] ?? null
}

function extractImageFromSrcset(srcset: string, baseUrl: string) {
  const candidates = srcset
    .split(',')
    .map((entry) => {
      const [url, descriptor] = entry.trim().split(/\s+/)
      const width = descriptor?.endsWith('w') ? Number(descriptor.slice(0, -1)) : 0
      return { url: absolutizeUrl(url, baseUrl), width: Number.isFinite(width) ? width : 0 }
    })
    .filter((entry) => entry.url)
    .sort((a, b) => b.width - a.width)

  return candidates[0]?.url ?? null
}

function extractImagesFromHtml(html: string, baseUrl: string) {
  const candidates: string[] = []

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const srcset = firstMatch(tag, /srcset=["']([^"']+)["']/i)
    const src = firstMatch(tag, /src=["']([^"']+)["']/i)
    const dataSrc = firstMatch(tag, /data-src=["']([^"']+)["']/i)
    const fromSrcset = srcset ? extractImageFromSrcset(srcset, baseUrl) : null

    if (fromSrcset) candidates.push(fromSrcset)
    if (dataSrc) candidates.push(dataSrc)
    if (src) candidates.push(src)
  }

  return candidates
}

function extractMediaCandidates(block: string) {
  return [
    extractAttribute(block, 'media:content', 'url'),
    extractAttribute(block, 'media:thumbnail', 'url'),
    extractAttribute(block, 'enclosure', 'url'),
  ]
}

function parseRssItems(xml: string, source: NewsSourceRow): SyndicatedItem[] {
  const blocks = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => match[0])
  return blocks.map((block) => {
    const title = normalizeWhitespace(stripHtml(extractTag(block, 'title')))
    const link = extractTag(block, 'link') || extractTag(block, 'guid')
    const description = extractTag(block, 'description') || extractTag(block, 'summary')
    const content = extractTag(block, 'content:encoded') || description
    const published = extractTag(block, 'pubDate') || extractTag(block, 'dc:date')
    const canonicalUrl = absolutizeUrl(link, source.site_url)
    const imageUrl = bestImageUrl([
      ...extractImagesFromHtml(content, source.site_url),
      ...extractMediaCandidates(block),
      extractOgImage(content, source.site_url),
    ], source.site_url)

    return {
      externalId: extractTag(block, 'guid') || canonicalUrl || title,
      title,
      summary: truncateMeta(description || content, 220),
      contentHtml: content || `<p>${title}</p>`,
      imageUrl,
      publishedAt: published ? new Date(published).toISOString() : null,
      canonicalUrl,
    }
  }).filter((item) => item.title && item.canonicalUrl)
}

function extractOgImage(html: string, baseUrl: string) {
  const image =
    firstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    firstMatch(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i)

  return image ? absolutizeUrl(decodeHtml(image), baseUrl) : null
}

async function fetchWordPressItems(source: NewsSourceRow): Promise<SyndicatedItem[]> {
  const posts = await fetchJson<WordPressPost[]>(source.feed_url)

  return posts.map((post) => {
    const featured = post._embedded?.['wp:featuredmedia']?.[0]
    const title = normalizeWhitespace(stripHtml(decodeHtml(post.title?.rendered ?? '')))
    const excerpt = post.excerpt?.rendered ?? ''
    const content = post.content?.rendered ?? excerpt
    const canonicalUrl = post.link ? absolutizeUrl(post.link, source.site_url) : `${source.site_url.replace(/\/$/, '')}/?p=${post.id}`
    const sizeCandidates = Object.values(featured?.media_details?.sizes ?? {})
      .sort((a, b) => ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0)))
      .map((size) => size.source_url)
    const imageUrl = bestImageUrl([
      featured?.source_url,
      ...sizeCandidates,
      ...extractImagesFromHtml(content, source.site_url),
      extractOgImage(content, source.site_url),
    ], source.site_url)

    return {
      externalId: String(post.id),
      title,
      summary: truncateMeta(excerpt || content, 220),
      contentHtml: content || `<p>${title}</p>`,
      imageUrl,
      publishedAt: post.date_gmt ? `${post.date_gmt.replace(' ', 'T')}Z` : post.date ?? null,
      canonicalUrl,
    }
  }).filter((item) => item.title && item.canonicalUrl)
}

async function fetchRssItems(source: NewsSourceRow) {
  return enrichItemsWithArticleContent(parseRssItems(await fetchText(source.feed_url), source), source)
}

function cleanArticleHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/\s(class|style|id|width|height|loading|decoding|sizes|srcset)=["'][^"']*["']/gi, '')
    .replace(/<(?!\/?(?:p|h2|h3|h4|blockquote|ul|ol|li|strong|b|em|i|a|br|hr)\b)[^>]+>/gi, ' ')
    .replace(/<a\b([^>]*)>/gi, (tag) => {
      const href = firstMatch(tag, /href=["']([^"']+)["']/i)
      return href ? `<a href="${decodeHtml(href)}">` : ''
    })
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

function extractArticleContent(html: string) {
  const candidates = [
    firstMatch(html, /<article\b[^>]*>([\s\S]*?)<\/article>/i),
    firstMatch(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i),
    firstMatch(html, /<div\b[^>]+class=["'][^"']*(?:entry-content|post-content|article-content|single-content|content-area|noticia|news)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i),
  ].filter(Boolean)

  const best = candidates
    .map((candidate) => cleanArticleHtml(candidate))
    .sort((a, b) => stripHtml(b).length - stripHtml(a).length)[0]

  return best && stripHtml(best).length > 250 ? best : null
}

async function enrichItemsWithArticleContent(items: SyndicatedItem[], source: NewsSourceRow) {
  const enriched: SyndicatedItem[] = []

  for (const item of items) {
    try {
      const html = await fetchText(item.canonicalUrl)
      const pageImage = bestImageUrl([
        extractOgImage(html, item.canonicalUrl),
        ...extractImagesFromHtml(html, item.canonicalUrl),
        item.imageUrl,
      ], item.canonicalUrl)
      const pageContent = extractArticleContent(html)
      const nextContent = pageContent && stripHtml(pageContent).length > stripHtml(item.contentHtml).length
        ? pageContent
        : item.contentHtml

      enriched.push({
        ...item,
        contentHtml: nextContent,
        summary: item.summary || truncateMeta(nextContent, 220),
        imageUrl: shouldReplaceImage(item.imageUrl, pageImage) ? pageImage : item.imageUrl,
      })
    } catch {
      enriched.push(item)
    }
  }

  return enriched
}

async function fetchHtmlOgItems(source: NewsSourceRow): Promise<SyndicatedItem[]> {
  const html = await fetchText(source.feed_url)
  const title = normalizeWhitespace(stripHtml(decodeHtml(
    firstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
  )))
  const summary = truncateMeta(
    decodeHtml(firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)),
    220,
  )

  if (!title) return []

  return [{
    externalId: source.feed_url,
    title,
    summary,
    contentHtml: `<p>${summary || title}</p>`,
    imageUrl: extractOgImage(html, source.site_url),
    publishedAt: null,
    canonicalUrl: source.feed_url,
  }]
}

async function fetchItems(source: NewsSourceRow) {
  if (source.source_type === 'wordpress') return enrichItemsWithArticleContent(await fetchWordPressItems(source), source)
  if (source.source_type === 'html_og') return enrichItemsWithArticleContent(await fetchHtmlOgItems(source), source)
  return fetchRssItems(source)
}

async function uniqueSlug(supabase: ReturnType<typeof createSupabaseAdmin>, title: string) {
  const base = slugify(title) || 'noticia'
  let candidate = base
  let n = 1

  while (true) {
    const { data } = await supabase.from('posts').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

function contentForPolicy(_source: NewsSourceRow, item: SyndicatedItem) {
  return item.contentHtml || `<p>${item.summary}</p>`
}

function shouldReplaceImage(currentUrl: string | null, nextUrl: string | null) {
  if (!nextUrl) return false
  if (!currentUrl) return true
  if (currentUrl === nextUrl) return false
  return imageScore(nextUrl) > imageScore(currentUrl) + 15
}

async function importItem(source: NewsSourceRow, item: SyndicatedItem, dryRun: boolean) {
  const supabase = createSupabaseAdmin()
  const hash = contentHash(item)

  const { data: existingByUrl } = await supabase
    .from('posts')
    .select('id,image_url')
    .eq('external_url', item.canonicalUrl)
    .maybeSingle()

  if (existingByUrl) {
    if (!dryRun && shouldReplaceImage(existingByUrl.image_url as string | null, item.imageUrl)) {
      await supabase.from('posts').update({ image_url: item.imageUrl }).eq('id', existingByUrl.id)
    }
    return false
  }

  const { data: existingByExternalId } = await supabase
    .from('posts')
    .select('id,image_url')
    .eq('source_id', source.id)
    .eq('external_id', item.externalId)
    .maybeSingle()

  if (existingByExternalId) {
    if (!dryRun && shouldReplaceImage(existingByExternalId.image_url as string | null, item.imageUrl)) {
      await supabase.from('posts').update({ image_url: item.imageUrl }).eq('id', existingByExternalId.id)
    }
    return false
  }
  if (dryRun) return true

  const slug = await uniqueSlug(supabase, item.title)
  const { error } = await supabase.from('posts').insert({
    organization_id: source.organization_id,
    title: item.title,
    slug,
    summary: item.summary || truncateMeta(item.contentHtml, 220),
    content: contentForPolicy(source, item),
    category: source.category,
    content_type: 'article',
    editorial_status: source.default_editorial_status,
    image_url: item.imageUrl,
    published_at: source.default_editorial_status === 'published'
      ? item.publishedAt || new Date().toISOString()
      : null,
    source_id: source.id,
    external_url: item.canonicalUrl,
    external_id: item.externalId,
    imported_at: new Date().toISOString(),
    content_hash: hash,
  })

  if (error) throw new Error(error.message)
  return true
}

export async function runSyndication(options: { dryRun?: boolean } = {}) {
  const supabase = createSupabaseAdmin()
  const dryRun = options.dryRun ?? false

  const { data, error } = await supabase
    .from('news_sources')
    .select('id,organization_id,name,site_url,feed_url,source_type,category,republish_policy,default_editorial_status,max_items_per_run')
    .eq('is_active', true)
    .order('last_checked_at', { ascending: true, nullsFirst: true })

  if (error) throw new Error(error.message)

  const sources = (data ?? []) as NewsSourceRow[]
  const results: SyndicationResult[] = []

  for (const source of sources) {
    let checked = 0
    let imported = 0
    let skipped = 0
    let resultError: string | null = null

    try {
      const items = (await fetchItems(source)).slice(0, source.max_items_per_run)
      checked = items.length

      for (const item of items) {
        const didImport = await importItem(source, item, dryRun)
        if (didImport) imported += 1
        else skipped += 1
      }

      if (!dryRun) {
        await supabase
          .from('news_sources')
          .update({ last_checked_at: new Date().toISOString(), last_success_at: new Date().toISOString(), last_error: null })
          .eq('id', source.id)
      }
    } catch (error) {
      resultError = error instanceof Error ? error.message : 'unknown_error'
      if (!dryRun) {
        await supabase
          .from('news_sources')
          .update({ last_checked_at: new Date().toISOString(), last_error: resultError })
          .eq('id', source.id)
      }
    }

    results.push({ sourceId: source.id, sourceName: source.name, checked, imported, skipped, error: resultError })
  }

  return {
    dryRun,
    sources: results.length,
    imported: results.reduce((total, result) => total + result.imported, 0),
    skipped: results.reduce((total, result) => total + result.skipped, 0),
    results,
  }
}









