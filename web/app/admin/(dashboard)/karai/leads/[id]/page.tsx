import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { LeadStatusForm } from './LeadStatusForm'

interface LeadRow {
  id: string
  profile_id: string
  excerpt: string
  status: 'new' | 'contacted' | 'closed'
  created_at: string
}

interface Props {
  params: Promise<{ id: string }>
}

async function loadLead(id: string) {
  const admin = createSupabaseAdmin()
  const { data: lead } = await admin
    .from('karai_leads')
    .select('id,profile_id,excerpt,status,created_at')
    .eq('id', id)
    .maybeSingle()

  if (!lead) return { lead: null, profile: null }

  const { data: profile } = await admin.from('profiles').select('name,email,phone').eq('id', lead.profile_id).maybeSingle()
  return { lead: lead as LeadRow, profile }
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const { lead, profile } = await loadLead(id)
  if (!lead) notFound()

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/karai" className="text-muted text-sm hover:text-foreground transition-colors">
          ← Karai
        </Link>
      </div>

      <div className="card">
        <h1 className="font-display font-bold text-xl text-white mb-1">{profile?.name ?? 'Sin perfil'}</h1>
        <p className="text-muted text-sm mb-4">
          {profile?.email ?? '—'} {profile?.phone ? `· ${profile.phone}` : ''}
        </p>

        <div className="rounded-xl bg-secondary border border-bdr p-4 mb-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1.5">Mensaje detectado</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{lead.excerpt}</p>
        </div>

        <p className="text-muted text-xs mb-4">Detectado el {new Date(lead.created_at).toLocaleString('es-PY')}</p>

        <LeadStatusForm id={lead.id} status={lead.status} />
      </div>
    </div>
  )
}
