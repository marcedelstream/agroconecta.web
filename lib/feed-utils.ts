import type { NewsArticle, UserProfile, AdSegment } from './types'
import type { FeedItem } from './feed-types'

export function buildSegment(user: UserProfile): AdSegment {
  return {
    profession: user.profession,
    department: user.department,
    categories: user.preferences,
  }
}

function insertAdsEvery(articles: NewsArticle[], n: number, segment?: AdSegment): FeedItem[] {
  const items: FeedItem[] = []
  articles.forEach((a, i) => {
    items.push({ kind: 'article', data: a })
    if ((i + 1) % n === 0) items.push({ kind: 'ad', segment })
  })
  return items
}

export function buildFeedItems(
  articles: NewsArticle[],
  user: UserProfile | null,
  featured: NewsArticle | undefined,
): { featured: NewsArticle | undefined; items: FeedItem[] } {
  const visibleByDepartment = articles.filter((a) => {
    const targets = a.targetDepartments ?? []
    return !user || targets.length === 0 || targets.includes(user.department)
  })
  const safeFeatured = featured && visibleByDepartment.some((a) => a.id === featured.id)
    ? featured
    : visibleByDepartment[0]
  const rest = visibleByDepartment.filter((a) => a.id !== safeFeatured?.id)

  const followedOrganizations = user?.organizationSubscriptions ?? user?.mediaPreferences ?? []
  const hasPrefs = (user?.preferences.length ?? 0) > 0 || followedOrganizations.length > 0

  if (!user || !hasPrefs) {
    const published = rest.filter((a) => (a.editorialStatus ?? 'published') === 'published')
    return { featured: safeFeatured, items: insertAdsEvery(published, 5) }
  }

  const segment = buildSegment(user)
  const prefs = new Set(user.preferences)
  const subscriptions = new Set(followedOrganizations)
  const published = rest.filter((a) => (a.editorialStatus ?? 'published') === 'published')

  const important = published.filter(
    (a) =>
      a.isImportant &&
      (prefs.has(a.category) ||
        (a.organizationId != null && subscriptions.has(a.organizationId)) ||
        (a.publisherId != null && subscriptions.has(a.publisherId))),
  )
  const importantIds = new Set(important.map((a) => a.id))

  const personalized = published.filter(
    (a) =>
      !importantIds.has(a.id) &&
      (prefs.has(a.category) ||
        (a.organizationId != null && subscriptions.has(a.organizationId)) ||
        (a.publisherId != null && subscriptions.has(a.publisherId))),
  )
  const discovery = published.filter(
    (a) =>
      !importantIds.has(a.id) &&
      !prefs.has(a.category) &&
      !(a.organizationId != null && subscriptions.has(a.organizationId)) &&
      !(a.publisherId != null && subscriptions.has(a.publisherId)),
  )

  const items: FeedItem[] = []

  if (important.length > 0) {
    items.push({ kind: 'section-header', title: 'Importante', subtitle: 'Avisos relevantes de tus cuentas e intereses' })
    important.forEach((a) => items.push({ kind: 'article', data: a }))
  }

  if (personalized.length > 0) {
    items.push({ kind: 'section-header', title: 'Para vos', subtitle: 'Cuentas seguidas e intereses elegidos' })
    personalized.forEach((a, i) => {
      items.push({ kind: 'article', data: a })
      if (i === 3 || (i === personalized.length - 1 && personalized.length <= 4)) {
        items.push({ kind: 'ad', segment })
      }
    })
  }

  if (discovery.length > 0) {
    items.push({ kind: 'section-header', title: 'Descubrí más', subtitle: 'Más noticias del campo' })
    discovery.forEach((a, i) => {
      items.push({ kind: 'article', data: a })
      if ((i + 1) % 5 === 0) items.push({ kind: 'ad', segment })
    })
  }

  return { featured: safeFeatured, items }
}
