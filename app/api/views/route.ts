import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function normalizePath(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim().split('?')[0]
  if (!trimmed.startsWith('/') || trimmed.length > 300) return null

  return trimmed.replace(/\/$/, '') || '/'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const path = normalizePath(body.path)

    if (!path) {
      return NextResponse.json({ ok: false, error: 'invalid_path' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase.rpc('increment_page_view', { p_path: path })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message, views: null }, { status: 500 })
    }

    return NextResponse.json({ ok: true, path, views: Number(data ?? 0) })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown_error', views: null },
      { status: 500 }
    )
  }
}
