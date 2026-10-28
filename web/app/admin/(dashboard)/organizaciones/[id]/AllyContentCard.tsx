import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { loadCandidatesByKeys } from '@/lib/feed/by-key'
import { loadEventCandidates, loadListingCandidates, loadPostCandidates } from '@/lib/feed/candidates'
import { createEventsClient } from '@/lib/feed/context'
import type { FeedCandidate } from '@/lib/feed/types'
import { Help } from '@/components/admin/ui'
import { addAllyContent, removeAllyContent } from './ally-content-actions'

const TYPE_LABEL: Record<string, string> = { evento: 'Evento', remate: 'Remate', noticia: 'Noticia', video: 'Video', curso: 'Curso', empleo: 'Empleo', producto: 'Clasificado', libro: 'Libro', servicio: 'Servicio' }

async function loadData(orgId: string) {
  const admin = createSupabaseAdmin()
  const events = createEventsClient()
  const now = new Date()
  const [linked, upcoming, listings, posts] = await Promise.all([
    admin.from('organization_content').select('content_key').eq('organization_id', orgId).order('position'),
    loadEventCandidates(events, now),
    loadListingCandidates(admin, now),
    loadPostCandidates(admin, now),
  ])
  const missingTable = !!linked.error
  const keys = ((linked.data ?? []) as { content_key: string }[]).map((r) => r.content_key)
  const found = keys.length ? await loadCandidatesByKeys(admin, events, keys) : new Map<string, FeedCandidate>()
  return { missingTable, keys, found, upcoming, listings, posts: posts.filter((p) => p.organizationId !== orgId).slice(0, 40) }
}

// Lo que el equipo le anexa a la página de un aliado en la app (además de sus propias noticias): un evento,
// un curso o aviso del Ecosistema, o una noticia de otra organización.
export async function AllyContentCard({ orgId }: { orgId: string }) {
  const { missingTable, keys, found, upcoming, listings, posts } = await loadData(orgId)
  const option = (c: FeedCandidate) => (
    <option key={c.key} value={c.key} disabled={keys.includes(c.key)}>
      {c.title}{c.startsAt ? ` — ${new Date(c.startsAt).toLocaleDateString('es-PY')}` : ''}
    </option>
  )

  return (
    <div className="card">
      <h2 className="font-display font-semibold text-base text-foreground mb-1 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-lime inline-block" />
        Página del aliado en la app
        <Help text="Sus noticias aparecen solas. Acá le anexás eventos, cursos o noticias de otros para que se vean en su página y en su widget." />
      </h2>
      <p className="text-muted text-xs mb-4">Eventos, cursos y avisos que se muestran en su página, además de sus propias noticias.</p>

      {missingTable && <p className="text-warning text-sm mb-4">Falta correr supabase/fix-v2-ally-content.sql para poder anexar contenido.</p>}

      {keys.length > 0 && (
        <ul className="flex flex-col gap-2 mb-4">
          {keys.map((key) => {
            const c = found.get(key)
            return (
              <li key={key} className="flex items-center justify-between gap-3 text-sm">
                <span className="line-clamp-1">
                  <span className="badge text-xs bg-secondary text-muted mr-2">{c ? TYPE_LABEL[c.contentType] ?? c.contentType : 'Ya no existe'}</span>
                  {c?.title ?? key}
                </span>
                <form action={removeAllyContent}>
                  <input type="hidden" name="organization_id" value={orgId} />
                  <input type="hidden" name="content_key" value={key} />
                  <button type="submit" className="btn-ghost text-xs">Quitar</button>
                </form>
              </li>
            )
          })}
        </ul>
      )}

      <form action={addAllyContent} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="organization_id" value={orgId} />
        <select name="content_key" required defaultValue="" className="input flex-1 min-w-[220px]">
          <option value="" disabled>Elegí qué anexar…</option>
          {upcoming.length > 0 && <optgroup label="Próximos eventos">{upcoming.map(option)}</optgroup>}
          {listings.length > 0 && <optgroup label="Cursos, empleos y clasificados">{listings.map(option)}</optgroup>}
          {posts.length > 0 && <optgroup label="Noticias de otras organizaciones">{posts.map(option)}</optgroup>}
        </select>
        <button type="submit" className="btn-primary text-xs" disabled={missingTable}>Anexar</button>
      </form>
    </div>
  )
}
