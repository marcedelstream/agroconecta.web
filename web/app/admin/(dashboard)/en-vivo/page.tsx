import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { ConfirmSubmitButton } from '../ConfirmSubmitButton'
import { createLiveSession, deleteLiveSession, toggleLiveSession, updateLiveSubtitle } from './actions'

interface LiveRow {
  id: string
  title: string
  subtitle: string | null
  stream_url: string
  source: string | null
  source_id: string | null
  is_live: boolean
  started_at: string | null
}

export const dynamic = 'force-dynamic'

// Aviso EN VIVO de la app v2: lo que está prendido acá aparece arriba del feed y en Explorar.
// Los remates cargados como publicación con estado "En vivo" aparecen solos, sin cargarlos acá.
export default async function EnVivoPage() {
  const { data, error } = await createSupabaseAdmin()
    .from('live_sessions')
    .select('id,title,subtitle,stream_url,source,source_id,is_live,started_at')
    .order('created_at', { ascending: false })
  const sessions = (data ?? []) as LiveRow[]

  return (
    <div className="max-w-6xl">
      <h1 className="font-display font-bold text-2xl text-white">En vivo</h1>
      <p className="text-muted text-sm mt-0.5 mb-6">Transmisiones que la app muestra en el aviso EN VIVO.</p>

      {error && <div className="card mb-6 border-danger/40 text-danger text-sm">No se pudo leer `live_sessions` (¿se corrió fix-v2-live-ads.sql?): {error.message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <form action={createLiveSession} className="card space-y-3 h-fit">
          <h2 className="font-display font-semibold text-base text-foreground">Nueva transmisión</h2>
          <input name="title" required className="input" placeholder="Feria de consumo · Remates del Chaco" />
          <input name="stream_url" required className="input" placeholder="https://www.youtube.com/live/..." />
          <input name="subtitle" className="input" placeholder="Dato en vivo (opcional): Lote 12/40" />
          <input name="image_url" className="input" placeholder="URL de miniatura (opcional)" />
          <div className="grid grid-cols-2 gap-2">
            <select name="source" className="input" defaultValue="">
              <option value="">Sin contenido asociado</option>
              <option value="event">Evento (slug)</option>
              <option value="post">Remate (id de publicación)</option>
            </select>
            <input name="source_id" className="input" placeholder="slug o id" />
          </div>
          <button type="submit" className="btn-primary text-sm w-full">Crear (queda apagada)</button>
        </form>

        <div className="card p-0 overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr><th>Transmisión</th><th>Dato en vivo</th><th>Estado</th><th /></tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <p className="text-white font-medium">{s.title}</p>
                    <a href={s.stream_url} target="_blank" rel="noreferrer" className="text-xs text-lime break-all">{s.stream_url}</a>
                  </td>
                  <td>
                    <form action={updateLiveSubtitle} className="flex gap-2">
                      <input type="hidden" name="id" value={s.id} />
                      <input name="subtitle" defaultValue={s.subtitle ?? ''} className="input text-xs" />
                      <button type="submit" className="btn-ghost text-xs">Guardar</button>
                    </form>
                  </td>
                  <td>
                    <form action={toggleLiveSession}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="is_live" value={String(s.is_live)} />
                      <button type="submit" className={s.is_live ? 'btn-primary text-xs' : 'btn-ghost text-xs'}>
                        {s.is_live ? '● En vivo — apagar' : 'Prender'}
                      </button>
                    </form>
                  </td>
                  <td>
                    <ConfirmSubmitButton action={deleteLiveSession} fields={{ id: s.id }} confirmMessage="¿Borrar esta transmisión?" label="Borrar" className="text-xs text-danger" />
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted text-sm py-8">Todavía no hay transmisiones cargadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
