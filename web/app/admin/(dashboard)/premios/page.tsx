import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createReward, markRedemptionUsed, toggleReward } from './actions'
import { FieldLabel, Help, Notice, PageHeader } from '@/components/admin/ui'
import type { FeedbackParams } from '@/lib/admin-feedback'

export const dynamic = 'force-dynamic'

interface RewardRow {
  id: string
  kind: string
  title: string
  partner_name: string | null
  cost: number
  stock: number | null
  is_active: boolean
}

interface RedemptionRow {
  id: string
  code: string
  status: string
  created_at: string
  rewards: { title: string } | null
}

interface Props {
  searchParams: Promise<FeedbackParams>
}

// Catálogo de canjes de la app v2 y validación de códigos. No lanzar premios sin confirmación real
// del aliado (decisión D4 del rediseño).
export default async function PremiosPage({ searchParams }: Props) {
  const feedback = await searchParams
  const db = createSupabaseAdmin()
  const [rewards, redemptions] = await Promise.all([
    db.from('rewards').select('id,kind,title,partner_name,cost,stock,is_active').order('created_at', { ascending: false }),
    db.from('reward_redemptions').select('id,code,status,created_at,rewards(title)').order('created_at', { ascending: false }).limit(100),
  ])
  const error = rewards.error ?? redemptions.error

  return (
    <div className="max-w-6xl space-y-8">
      <PageHeader title="Premios y canjes" help="Lo que los usuarios canjean con sus puntos. Acá cargás premios y validás los códigos que te pasa el aliado." />
      <Notice {...feedback} />

      {error && <div className="card border-danger/40 text-danger text-sm">No se pudo leer (¿se corrió fix-v2-rewards.sql?): {error.message}</div>}

      <form action={markRedemptionUsed} className="card flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-foreground">Validar código<Help text="Cuando el aliado te pase un código AGRO-XXXX, escribilo acá. Una vez marcado como usado no se puede volver atrás." /></span>
        <input name="code" required className="input max-w-[200px] uppercase" placeholder="AGRO-XXXX" />
        <button type="submit" className="btn-primary text-sm">Marcar como usado</button>
      </form>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <form action={createReward} className="card space-y-3 h-fit">
          <h2 className="font-display font-semibold text-lg text-foreground">Nuevo premio</h2>
          <p className="text-xs text-muted">Cargá solo premios confirmados por el aliado.</p>
          <input name="title" required className="input" placeholder="Curso de manejo de pasturas" />
          <select name="kind" className="input" defaultValue="curso">
            <option value="curso">Curso</option>
            <option value="evento">Evento</option>
            <option value="charla">Charla</option>
          </select>
          <input name="partner_name" className="input" placeholder="Aliado que lo ofrece" />
          <textarea name="description" className="input min-h-[70px]" placeholder="Descripción (opcional)" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel help="Cuántos puntos cuesta. Como referencia: una encuesta da 10.">Costo</FieldLabel>
              <input name="cost" required type="number" min={1} className="input" placeholder="200" />
            </div>
            <div>
              <FieldLabel help="Cuántas personas lo pueden canjear. Vacío = sin límite.">Cupos</FieldLabel>
              <input name="stock" type="number" min={0} className="input" placeholder="20" />
            </div>
          </div>
          <div>
            <FieldLabel help="Opcional. Después de esta fecha deja de aparecer en la app.">Válido hasta</FieldLabel>
            <input name="valid_until" type="date" className="input" />
          </div>
          <button type="submit" className="btn-primary text-sm w-full">Crear premio</button>
        </form>

        <div className="space-y-6">
          <div className="card p-0 overflow-hidden">
            <table className="admin-table">
              <thead><tr><th>Premio</th><th>Costo</th><th>Cupos</th><th>Estado</th></tr></thead>
              <tbody>
                {((rewards.data ?? []) as RewardRow[]).map((r) => (
                  <tr key={r.id}>
                    <td><p className="text-foreground font-medium">{r.title}</p><p className="text-xs text-muted">{r.kind}{r.partner_name ? ` · ${r.partner_name}` : ''}</p></td>
                    <td>{r.cost} pts</td>
                    <td>{r.stock ?? '∞'}</td>
                    <td>
                      <form action={toggleReward}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="is_active" value={String(r.is_active)} />
                        <button type="submit" className={r.is_active ? 'btn-primary text-xs' : 'btn-ghost text-xs'}>{r.is_active ? 'Activo — pausar' : 'Activar'}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="admin-table">
              <thead><tr><th>Código</th><th>Premio</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                {((redemptions.data ?? []) as unknown as RedemptionRow[]).map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-foreground">{r.code}</td>
                    <td>{r.rewards?.title ?? '—'}</td>
                    <td>{r.status}</td>
                    <td className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString('es-PY')}</td>
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
