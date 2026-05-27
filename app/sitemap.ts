import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { postPath, siteUrl } from '@/lib/seo'
import type { PostRow } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${siteUrl}/ecosistema`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/quienes-somos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return staticRoutes

  try {
    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await supabase
      .from('posts')
      .select('id,title,published_at,created_at')
      .eq('editorial_status', 'published')
      .order('published_at', { ascending: false })
      .limit(500)

    if (error) return staticRoutes

    const posts = (data ?? []) as Pick<PostRow, 'id' | 'title' | 'published_at' | 'created_at'>[]
    return [
      ...staticRoutes,
      ...posts.map((post) => ({
        url: `${siteUrl}${postPath(post)}`,
        lastModified: new Date(post.published_at ?? post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ]
  } catch {
    return staticRoutes
  }
}
