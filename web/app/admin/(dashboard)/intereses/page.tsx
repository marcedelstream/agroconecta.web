import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { CreateDrawer } from '@/components/admin/CreateDrawer'
import { EmptyState, FieldLabel, Notice, PageHeader, SectionTabs } from '@/components/admin/ui'
import type { FeedbackParams } from '@/lib/admin-feedback'
import { INTEREST_KINDS, loadInterestOptions, type InterestKind } from '@/lib/interest-options'
import { createInterest, renameInterest, toggleInterest } from './actions'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ tipo?: string } & FeedbackParams>
}

// Intereses de la app (onboarding, filtros del Inicio y recomendaciones del feed). Lo que se cambia acá se
// ve en la app sin sacar una actualización.
export default async function InteresesPage({ searchParams }: Props) {
  const { tipo, ...feedback } = await searchParams
  const kind = (INTEREST_KINDS.find((k) => k.value === tipo)?.value ?? 'rubro') as InterestKind
  const meta = INTEREST_KINDS.find((k) => k.value === kind)!
  const all = await loadInterestOptions(createSupabaseAdmin())
  const rows = all.filter((o) => o.kind === kind)
  const rubros = all.filter((o) => o.kind === 'rubro')
  const rubroLabel = (value: string | null) => rubros.find((r) => r.value === value)?.label ?? value ?? '—'
  // "Qué producen" se lee mejor agrupado por rubro.
  const sorted = kind === 'produccion' ? [...rows].sort((a, b) => rubroLabel(a.parent).localeCompare(rubroLabel(b.parent)) || a.position - b.position) : rows

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Intereses"
        help="Las opciones que elige la gente al entrar a la app (rubros, qué produce, para qué la usa y su escala). Con eso la app le arma un feed a su medida. Lo que cambies acá aparece en la app al instante."
      />
      <Notice {...feedback} />

      <SectionTabs tabs={INTEREST_KINDS.map((k) => ({ href: `/admin/intereses?tipo=${k.value}`, label: k.label }))} current={`/admin/intereses?tipo=${kind}`} />
      <p className="text-sm text-muted -mt-3">{meta.help}</p>

      <div className="flex justify-end">
        <CreateDrawer label="Agregar opción" title={`Agregar a ${meta.label}`} description="Aparece en la app apenas la guardás.">
          <form action={createInterest} className="card space-y-3 h-fit">
            <input type="hidden" name="kind" value={kind} />
            <div>
              <FieldLabel help="Como lo va a ver la gente en la app. Ej.: Forestal, Apicultura, Productor familiar.">Nombre</FieldLabel>
              <input name="label" required className="input" placeholder="Ej.: Apicultura" />
            </div>
            {kind === 'produccion' && (
              <div>
                <FieldLabel help="Aparece cuando la persona elige este rubro en el onboarding.">Rubro</FieldLabel>
                <select name="parent" required className="input" defaultValue={rubros[0]?.value}>
                  {rubros.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            )}
            {kind === 'rubro' && (
              <p className="text-xs text-muted">
                Un rubro nuevo también aparece como categoría al cargar publicaciones, así el feed tiene contenido para recomendar.
              </p>
            )}
            <button type="submit" className="btn-primary text-sm w-full">Agregar</button>
          </form>
        </CreateDrawer>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="Todavía no hay opciones" text="Corré supabase/fix-v2-interests.sql o agregá la primera con el botón de arriba." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre y orden</th>
                {kind === 'produccion' && <th>Rubro</th>}
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => (
                <tr key={o.id} className={o.is_active ? '' : 'opacity-60'}>
                  <td>
                    <form action={renameInterest} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="kind" value={kind} />
                      <input name="label" defaultValue={o.label} className="input py-2 max-w-[240px]" aria-label="Nombre" />
                      <input name="position" type="number" min={0} defaultValue={o.position} className="input py-2 w-20" aria-label="Orden" title="Orden: los números más chicos aparecen primero" />
                      <button type="submit" className="btn-ghost text-xs">Guardar</button>
                    </form>
                  </td>
                  {kind === 'produccion' && <td className="text-sm">{rubroLabel(o.parent)}</td>}
                  <td>
                    <form action={toggleInterest}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="kind" value={kind} />
                      <input type="hidden" name="is_active" value={String(o.is_active)} />
                      <button type="submit" className={o.is_active ? 'btn-primary text-xs' : 'btn-ghost text-xs'}>
                        {o.is_active ? 'Visible — ocultar' : 'Oculta — mostrar'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
