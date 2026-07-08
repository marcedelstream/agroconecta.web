import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase-server'
import { CATEGORY_LABELS, DEPARTMENT_LABELS, LINK_TYPE_LABELS, type AdCampaignRow } from '@/lib/types'
import { deleteBanner, toggleBanner } from './actions'
import { BannerForm } from './BannerForm'

async function loadBanners() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('id,title,image_url,target_professions,target_departments,target_categories,starts_at,ends_at,is_active,link_type,link_target')
    .order('created_at', { ascending: false })
  return {
    banners: (data ?? []) as AdCampaignRow[],
    error: error?.message ?? null,
  }
}

function SegmentText({ banner }: { banner: AdCampaignRow }) {
  const categories = banner.target_categories?.map((cat) => CATEGORY_LABELS[cat]) ?? []
  const departments = banner.target_departments?.map((dep) => DEPARTMENT_LABELS[dep]) ?? []
  const professions = banner.target_professions ?? []
  const parts = [
    professions.length ? professions.join(', ') : 'Todas las profesiones',
    categories.length ? categories.join(', ') : 'Todas las categorías',
    departments.length ? departments.join(', ') : 'Todos los departamentos',
  ]
  return <span>{parts.join(' · ')}</span>
}

export default async function BannersPage() {
  const { banners, error } = await loadBanners()

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Banners</h1>
          <p className="text-muted text-sm mt-0.5">Campañas segmentadas por perfil, categoría y departamento.</p>
        </div>
      </div>

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `ad_campaigns`: {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <BannerForm />

        {/* ── Tabla de banners ── */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Campaña</th>
                  <th>Destino</th>
                  <th>Segmentación</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted">
                      No hay banners cargados.
                    </td>
                  </tr>
                )}
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <div className="relative w-32 h-10 rounded-md overflow-hidden bg-secondary">
                        <Image src={banner.image_url} alt={banner.title} fill className="object-cover" sizes="128px" />
                      </div>
                    </td>
                    <td>
                      <p className="font-medium">{banner.title}</p>
                    </td>
                    <td className="text-xs text-muted">
                      {banner.link_type
                        ? <span>{LINK_TYPE_LABELS[banner.link_type]}: <code>{banner.link_target}</code></span>
                        : <span>—</span>}
                    </td>
                    <td className="text-xs text-muted max-w-sm">
                      <SegmentText banner={banner} />
                    </td>
                    <td>
                      <span className={`badge text-xs ${banner.is_active ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'}`}>
                        {banner.is_active ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <form action={toggleBanner}>
                          <input type="hidden" name="id" value={banner.id} />
                          <input type="hidden" name="is_active" value={String(banner.is_active)} />
                          <button type="submit" className="btn text-xs">
                            {banner.is_active ? 'Pausar' : 'Activar'}
                          </button>
                        </form>
                        <form action={deleteBanner} onSubmit={(e) => { if (!confirm('¿Eliminar este banner?')) e.preventDefault() }}>
                          <input type="hidden" name="id" value={banner.id} />
                          <input type="hidden" name="image_url" value={banner.image_url} />
                          <button type="submit" className="btn text-xs text-danger border-danger/40 hover:bg-danger/10">
                            Eliminar
                          </button>
                        </form>
                      </div>
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
