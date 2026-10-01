import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { uniquePostSlug } from '@/lib/post-slug'
import { loadInterestOptions } from '@/lib/interest-options'

export const dynamic = 'force-dynamic'

// Publicar desde la app (review v2): solo miembros de una organización con plan vigente (el plan de
// organizaciones se contrata por fuera de la app). Todo entra "En revisión" y lo aprueba el equipo en
// /admin/publicaciones — nada se publica directo.

const PUBLISHING_STATUSES = ['trial', 'active']
const TYPES = ['article', 'video'] as const
const BASE_CATEGORIES = ['agricultura', 'ganaderia', 'horticultura', 'tecnologia', 'mercados']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const LIMITS = { title: 140, summary: 300, content: 12_000 }

interface OrgRow {
  organizations: { id: string; name: string; logo_url: string | null; commercial_status: string } | null
}

async function publishingOrgs(admin: SupabaseClient, userId: string) {
  const { data } = await admin
    .from('organization_members')
    .select('organizations(id,name,logo_url,commercial_status)')
    .eq('user_id', userId)
  return ((data ?? []) as unknown as OrgRow[])
    .map((r) => r.organizations)
    .filter((o): o is NonNullable<OrgRow['organizations']> => !!o && PUBLISHING_STATUSES.includes(o.commercial_status))
    .map((o) => ({ id: o.id, name: o.name, logoUrl: o.logo_url }))
}

export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  return NextResponse.json({ organizations: await publishingOrgs(auth.admin, auth.profileId) }, { headers: { 'Cache-Control': 'no-store' } })
}

interface Body {
  organizationId?: string
  type?: string
  title?: string
  summary?: string
  content?: string
  category?: string
  youtubeUrl?: string
  imageBase64?: string
  imageType?: string
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })

  const orgs = await publishingOrgs(auth.admin, auth.profileId)
  const org = orgs.find((o) => o.id === body.organizationId)
  if (!org) return NextResponse.json({ error: 'Tu organización no tiene un plan activo para publicar.' }, { status: 403 })

  const type = (TYPES as readonly string[]).includes(body.type ?? '') ? (body.type as (typeof TYPES)[number]) : 'article'
  const title = text(body.title, LIMITS.title)
  const summary = text(body.summary, LIMITS.summary)
  const content = text(body.content, LIMITS.content)
  const rubros = (await loadInterestOptions(auth.admin, true)).filter((o) => o.kind === 'rubro').map((o) => o.value)
  const categories = new Set([...BASE_CATEGORIES, ...rubros])
  const category = categories.has(body.category ?? '') ? body.category! : 'agricultura'
  const youtubeUrl = text(body.youtubeUrl, 300)
  if (title.length < 5 || summary.length < 10) return NextResponse.json({ error: 'Completá el título y la bajada.' }, { status: 400 })
  if (type === 'video' && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(youtubeUrl)) {
    return NextResponse.json({ error: 'Pegá el link de YouTube del video.' }, { status: 400 })
  }

  let imageUrl: string | null = null
  if (body.imageBase64) {
    const ext = IMAGE_TYPES[body.imageType ?? '']
    const bytes = Buffer.from(body.imageBase64, 'base64')
    if (!ext || bytes.length > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'La imagen tiene que ser JPG, PNG o WEBP de hasta 5 MB.' }, { status: 400 })
    const path = `app/${org.id}/${crypto.randomUUID()}.${ext}`
    const { error } = await auth.admin.storage.from('post-images').upload(path, bytes, { contentType: body.imageType })
    if (error) return NextResponse.json({ error: 'No se pudo subir la imagen.' }, { status: 500 })
    imageUrl = auth.admin.storage.from('post-images').getPublicUrl(path).data.publicUrl
  }

  const { error } = await auth.admin.from('posts').insert({
    organization_id: org.id,
    author_id: auth.profileId,
    title,
    slug: await uniquePostSlug(auth.admin, title),
    summary,
    content: content || summary,
    category,
    content_type: type,
    editorial_status: 'pending_review',
    image_url: imageUrl,
    youtube_url: type === 'video' ? youtubeUrl : null,
  })
  if (error) {
    console.error('POST /api/publish falló:', error.message)
    return NextResponse.json({ error: 'No pudimos enviar la publicación.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
