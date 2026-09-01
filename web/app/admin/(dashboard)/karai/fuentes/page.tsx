import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { KnowledgeSourceForm } from './KnowledgeSourceForm'
import { SourceRowActions } from './SourceRowActions'

interface SourceRow {
  id: string
  kind: 'link' | 'document'
  title: string
  url: string | null
  content: string | null
  is_active: boolean
  created_at: string
}

async function loadSources() {
  const admin = createSupabaseAdmin()
  const { data } = await admin
    .from('karai_knowledge_sources')
    .select('id,kind,title,url,content,is_active,created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as SourceRow[]
}

export default async function KnowledgeSourcesPage() {
  const sources = await loadSources()

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/karai" className="text-muted text-sm hover:text-foreground transition-colors">
          ← Karai
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Base de conocimiento</h1>
        <p className="text-muted text-sm mt-0.5">
          Links y documentos de confianza que Karai usa cuando Agroconecta no tiene el dato en noticias o precios.
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
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-muted">
                      No hay fuentes cargadas.
                    </td>
                  </tr>
                )}
                {sources.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <p className="font-medium">{s.title}</p>
                      {s.url && <p className="text-muted text-xs truncate max-w-[220px]">{s.url}</p>}
                    </td>
                    <td className="text-muted text-sm capitalize">{s.kind === 'link' ? 'Link' : 'Documento'}</td>
                    <td>
                      <span className={`badge text-xs ${s.is_active ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'}`}>
                        {s.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <SourceRowActions id={s.id} isActive={s.is_active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
