import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase-server'
import { CATEGORY_LABELS, DEPARTMENT_LABELS, type AdCampaignRow, type Department, type NewsCategory } from '@/lib/types'
import { createBanner, toggleBanner } from './actions'

async function loadBanners() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('id,title,image_url,target_professions,target_departments,target_categories,starts_at,ends_at,is_active')
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
        <form action={createBanner} className="card space-y-4 h-fit">
          <h2 className="font-display font-semibold text-base text-foreground">Nuevo banner</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
            <input name="title" required className="input" placeholder="Remate Brangus destacado" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">URL de imagen</label>
            <input name="image_url" required className="input" placeholder="https://.../banners/demo/banner.png" />
            <p className="text-xs text-muted mt-1">Formato recomendado: 640 × 200 px.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Profesiones</label>
            <input name="target_professions" className="input" placeholder="productor, veterinario" />
            <p className="text-xs text-muted mt-1">Vacío = todas.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Categorías</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CATEGORY_LABELS) as [NewsCategory, string][]).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-xs text-muted">
                  <input type="checkbox" name="target_categories" value={value} className="accent-lime" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Departamentos</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-xs text-muted">
                  <input type="checkbox" name="target_departments" value={value} className="accent-lime" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="is_active" defaultChecked className="accent-lime" />
            Activo
          </label>

          <button type="submit" className="btn-primary text-sm w-full">Crear banner</button>
        </form>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Campaña</th>
                  <th>Segmentación</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted">
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
                      <p className="text-xs text-muted break-all max-w-xs">{banner.image_url}</p>
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
                      <form action={toggleBanner}>
                        <input type="hidden" name="id" value={banner.id} />
                        <input type="hidden" name="is_active" value={String(banner.is_active)} />
                        <button type="submit" className="btn text-xs">
                          {banner.is_active ? 'Pausar' : 'Activar'}
                        </button>
                      </form>
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
