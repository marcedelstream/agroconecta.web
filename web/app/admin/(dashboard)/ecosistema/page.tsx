import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createEcosystemSite, deleteEcosystemSite, toggleEcosystemSite } from './actions'

interface EcosystemSiteRow {
  id: string
  name: string
  description: string
  url: string | null
  logo_url: string | null
  category: string
  is_available: boolean
  order_index: number
}

async function loadSites() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('ecosystem_sites')
    .select('id,name,description,url,logo_url,category,is_available,order_index')
    .order('order_index', { ascending: true })
  return {
    sites: (data ?? []) as EcosystemSiteRow[],
    error: error?.message ?? null,
  }
}

export default async function EcosistemaPage() {
  const { sites, error } = await loadSites()

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white">Ecosistema</h1>
        <p className="text-muted text-sm mt-0.5">
          Plataformas del ecosistema que se ven en la pestaña Ecosistema de la app. Los slots marcados como
          "No disponible" se muestran con un placeholder genérico "Próximamente nuevas soluciones".
        </p>
      </div>

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `ecosystem_sites`: {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <form action={createEcosystemSite} encType="multipart/form-data" className="card space-y-4 h-fit">
          <h2 className="font-display font-semibold text-base text-foreground">Nueva plataforma</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
            <input name="name" required className="input" placeholder="AgroJuego" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <textarea name="description" rows={2} className="input resize-none" placeholder="Descripción corta" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">URL (opcional)</label>
            <input name="url" type="text" className="input" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Logo</label>
            <input
              name="logo_file"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-muted
                file:mr-3 file:py-1.5 file:px-3
                file:rounded file:border-0
                file:text-xs file:font-semibold
                file:bg-lime/15 file:text-lime
                hover:file:bg-lime/25 cursor-pointer"
            />
            <p className="text-xs text-muted mt-1">Cuadrado, fondo transparente recomendado. Máx. 4 MB.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Categoría</label>
            <select name="category" className="input" defaultValue="institucional">
              <option value="eventos">Eventos</option>
              <option value="juegos">Juegos</option>
              <option value="institucional">Institucional</option>
              <option value="streaming">Streaming</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Orden</label>
            <input name="order_index" type="number" defaultValue={0} className="input" />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="is_available" defaultChecked className="accent-lime" />
            Disponible (si no, se muestra como "Próximamente")
          </label>

          <button type="submit" className="btn-primary text-sm w-full">Crear</button>
        </form>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sites.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted">
                      No hay plataformas cargadas.
                    </td>
                  </tr>
                )}
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-secondary flex items-center justify-center">
                        {site.logo_url
                          ? <Image src={site.logo_url} alt={site.name} fill className="object-contain" sizes="48px" />
                          : <span className="text-xs text-muted">—</span>}
                      </div>
                    </td>
                    <td>
                      <p className="font-medium">{site.name}</p>
                      <p className="text-xs text-muted max-w-xs truncate">{site.description}</p>
                    </td>
                    <td className="text-xs text-muted capitalize">{site.category}</td>
                    <td>
                      <span className={`badge text-xs ${site.is_available ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'}`}>
                        {site.is_available ? 'Disponible' : 'Próximamente'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <form action={toggleEcosystemSite}>
                          <input type="hidden" name="id" value={site.id} />
                          <input type="hidden" name="is_available" value={String(site.is_available)} />
                          <button type="submit" className="btn text-xs">
                            {site.is_available ? 'Marcar próximamente' : 'Marcar disponible'}
                          </button>
                        </form>
                        <form action={deleteEcosystemSite} onSubmit={(e) => { if (!confirm('¿Eliminar esta plataforma?')) e.preventDefault() }}>
                          <input type="hidden" name="id" value={site.id} />
                          <input type="hidden" name="logo_url" value={site.logo_url ?? ''} />
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
