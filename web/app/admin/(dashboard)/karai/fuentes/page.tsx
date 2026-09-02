import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { KnowledgeSourceForm } from './KnowledgeSourceForm'
import { SourceRowActions } from './SourceRowActions'
import { SOURCE_LEVEL_LABELS, SOURCE_STATUS_LABELS, type KaraiSourceLevel, type KaraiSourceStatus } from '@/lib/karai/knowledge-types'

interface SourceRow {
  id: string
  kind: 'link' | 'document'
  title: string
  url: string | null
  content: string | null
  publisher: string | null
  source_level: KaraiSourceLevel | null
  topic: string | null
  geography: string
  issued_at: string | null
  reviewed_at: string | null
  expires_at: string | null
  status: KaraiSourceStatus
  created_at: string
}

async function loadSources() {
  const admin = createSupabaseAdmin()
  const { data } = await admin
    .from('karai_knowledge_sources')
    .select('id,kind,title,url,content,publisher,source_level,topic,geography,issued_at,reviewed_at,expires_at,status,created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as SourceRow[]
}

const STATUS_STYLE: Record<KaraiSourceStatus, string> = {
  pendiente: 'bg-warning/15 text-warning',
  aprobado: 'bg-success/15 text-success',
  vencido: 'bg-danger/15 text-danger',
  retirado: 'bg-muted/15 text-muted',
}

function isExpired(expiresAt: string | null) {
  return Boolean(expiresAt && new Date(expiresAt) < new Date())
}

export default async function KnowledgeSourcesPage() {
  const sources = await loadSources()

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/karai" className="text-muted text-sm hover:text-foreground transition-colors">
          ← Karai
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Base de conocimiento</h1>
        <p className="text-muted text-sm mt-0.5">
          Links y documentos de confianza que Karai usa cuando Agroconecta no tiene el dato en noticias o precios.
          Solo las fuentes <strong>aprobadas y vigentes</strong> se usan en el chat.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div>
          <h2 className="font-display font-semibold text-base text-white mb-3">Nueva fuente</h2>
          <KnowledgeSourceForm />
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Responsable</th>
                  <th>Nivel</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted">
                      No hay fuentes cargadas.
                    </td>
                  </tr>
                )}
                {sources.map((s) => {
                  const expired = isExpired(s.expires_at)
                  const effectiveStatus = expired && s.status === 'aprobado' ? 'vencido' : s.status
                  return (
                    <tr key={s.id}>
                      <td>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-muted text-xs">{s.kind === 'link' ? s.url : 'Documento'}{s.topic ? ` · ${s.topic}` : ''}</p>
                      </td>
                      <td className="text-muted text-sm">{s.publisher ?? '—'}</td>
                      <td className="text-muted text-xs">{s.source_level ? SOURCE_LEVEL_LABELS[s.source_level] : '—'}</td>
                      <td className="text-muted text-xs">
                        {s.expires_at ? `hasta ${new Date(s.expires_at).toLocaleDateString('es-PY')}` : 'sin vencimiento'}
                      </td>
                      <td>
                        <span className={`badge text-xs ${STATUS_STYLE[effectiveStatus]}`}>{SOURCE_STATUS_LABELS[effectiveStatus]}</span>
                      </td>
                      <td>
                        <SourceRowActions id={s.id} status={s.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
