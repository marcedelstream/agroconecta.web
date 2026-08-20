import { createSupabaseServer } from '@/lib/supabase-server'
import type { EventScheduleItemRow, PostRow } from '@/lib/types'
import { addScheduleItem, deleteScheduleItem, tagPostToEvent, saveEventMedia } from './actions'

interface EventMediaRow {
  event_slug: string
  profile_image_url: string | null
  banner_image_url: string | null
  is_active: boolean
}

async function loadKnownSlugs() {
  const supabase = await createSupabaseServer()
  const [campaigns, schedule] = await Promise.all([
    supabase.from('ad_campaigns').select('link_target').eq('link_type', 'event'),
    supabase.from('event_schedule_items').select('event_slug'),
  ])
  const slugs = new Set<string>()
  for (const row of campaigns.data ?? []) if (row.link_target) slugs.add(row.link_target)
  for (const row of schedule.data ?? []) slugs.add(row.event_slug)
  return Array.from(slugs)
}

type PostPick = Pick<PostRow, 'id' | 'title'>

async function loadEventData(slug: string) {
  const supabase = await createSupabaseServer()
  const [schedule, taggedPosts, recentPosts, media] = await Promise.all([
    supabase
      .from('event_schedule_items')
      .select('*')
      .eq('event_slug', slug)
      .order('order_index', { ascending: true }),
    supabase
      .from('posts')
      .select('id,title')
      .eq('event_tag', slug)
      .order('published_at', { ascending: false }),
    supabase
      .from('posts')
      .select('id,title')
      .eq('editorial_status', 'published')
      .is('event_tag', null)
      .order('published_at', { ascending: false })
      .limit(15),
    supabase
      .from('event_media')
      .select('*')
      .eq('event_slug', slug)
      .maybeSingle(),
  ])

  return {
    schedule: (schedule.data ?? []) as EventScheduleItemRow[],
    taggedPosts: (taggedPosts.data ?? []) as PostPick[],
    recentPosts: (recentPosts.data ?? []) as PostPick[],
    media: (media.data ?? null) as EventMediaRow | null,
  }
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  const knownSlugs = await loadKnownSlugs()
  const data = slug ? await loadEventData(slug) : null

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white">Cobertura de eventos</h1>
        <p className="text-muted text-sm mt-0.5">
          Programa y noticias asociadas para el hub de un evento. Los datos base del evento (título, fecha, lugar)
          vienen de eventosagropy.com — acá solo se agrega el extra que se ve dentro de la app.
        </p>
      </div>

      <form action="/admin/eventos" className="card flex flex-wrap items-end gap-3 mb-6">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm font-medium text-foreground mb-1.5">Slug del evento</label>
          <input
            name="slug"
            defaultValue={slug ?? ''}
            className="input"
            placeholder="ej: expo-agro-2026"
          />
        </div>
        <button type="submit" className="btn-primary text-sm">Cargar</button>
      </form>

      {knownSlugs.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {knownSlugs.map((s) => (
            <a key={s} href={`/admin/eventos?slug=${encodeURIComponent(s)}`} className="badge text-xs bg-secondary text-muted hover:text-white">
              {s}
            </a>
          ))}
        </div>
      )}

      {!slug && (
        <div className="card text-sm text-muted">
          Ingresá el slug de un evento (el mismo que pusiste como destino del banner en{' '}
          <a href="/admin/banners" className="text-lime">Banners</a>) para gestionar su programa y sus noticias.
        </div>
      )}

      {slug && data && (
        <div className="space-y-6">
          {/* Imágenes del evento */}
          <div className="card">
            <h2 className="font-display font-semibold text-base text-foreground mb-1">
              Imágenes — <code>{slug}</code>
            </h2>
            <p className="text-muted text-xs mb-4">
              Foto de perfil (círculo sobre la portada) y banner promocional del hub del evento en la app.
              No tocan eventosagropy.com — quedan solo del lado de Agroconecta.
            </p>

            <form action={saveEventMedia} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input type="hidden" name="event_slug" value={slug} />
              <input type="hidden" name="existing_profile_url" value={data.media?.profile_image_url ?? ''} />
              <input type="hidden" name="existing_banner_url" value={data.media?.banner_image_url ?? ''} />

              <label className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-bdr px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={data.media?.is_active ?? false}
                  className="mt-0.5 h-4 w-4 accent-lime"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">Evento activo (destacado en el Home de la app)</span>
                  <span className="block text-xs text-muted mt-0.5">
                    Mientras esté sin marcar podés probar el hub del evento tranquilo — no se muestra en el Home.
                    Activarlo acá apaga automáticamente cualquier otro evento que estuviera destacado.
                  </span>
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Foto de perfil</label>
                {data.media?.profile_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.media.profile_image_url}
                    alt="Foto de perfil actual"
                    className="w-16 h-16 rounded-full object-cover border border-bdr mb-2"
                  />
                )}
                <input
                  name="profile_image_file"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-lime-dark"
                />
                <p className="text-xs text-muted mt-1">Imagen cuadrada recomendada. Máximo 8 MB.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Banner promocional</label>
                {data.media?.banner_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.media.banner_image_url}
                    alt="Banner actual"
                    className="w-full h-20 rounded-lg object-cover border border-bdr mb-2"
                  />
                )}
                <input
                  name="banner_image_file"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-lime-dark"
                />
                <p className="text-xs text-muted mt-1">Se usa como portada del hub del evento. Máximo 8 MB.</p>
              </div>

              <button type="submit" className="btn-primary text-xs sm:col-span-2 justify-self-start">
                Guardar imágenes
              </button>
            </form>
          </div>

          {/* Programa */}
          <div className="card">
            <h2 className="font-display font-semibold text-base text-foreground mb-4">
              Programa — <code>{slug}</code>
            </h2>

            <form action={addScheduleItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
              <input type="hidden" name="event_slug" value={slug} />
              <input name="day_label" className="input" placeholder="Día (ej: Día 1 - 15 oct)" />
              <input name="time" className="input" placeholder="Hora (ej: 09:00)" />
              <input name="title" required className="input lg:col-span-2" placeholder="Título de la actividad *" />
              <input name="speaker" className="input" placeholder="Disertante" />
              <input name="order_index" type="number" className="input" placeholder="Orden" defaultValue={data.schedule.length} />
              <input name="description" className="input sm:col-span-2 lg:col-span-5" placeholder="Descripción (opcional)" />
              <button type="submit" className="btn-primary text-xs">Agregar</button>
            </form>

            <div className="space-y-2">
              {data.schedule.length === 0 && (
                <p className="text-sm text-muted">Todavía no hay agenda cargada para este evento.</p>
              )}
              {data.schedule.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-bdr px-4 py-3">
                  <div className="text-sm">
                    <p className="text-muted text-xs">
                      {[item.day_label, item.time].filter(Boolean).join(' · ') || 'Sin horario'}
                    </p>
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.speaker && <p className="text-xs text-muted">{item.speaker}</p>}
                    {item.description && <p className="text-xs text-muted mt-1">{item.description}</p>}
                  </div>
                  <form action={deleteScheduleItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="btn text-xs text-danger border-danger/40 hover:bg-danger/10">
                      Eliminar
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>

          {/* Noticias asociadas */}
          <div className="card">
            <h2 className="font-display font-semibold text-base text-foreground mb-4">Noticias asociadas</h2>

            {data.taggedPosts.length === 0 && (
              <p className="text-sm text-muted mb-4">Ninguna publicación está etiquetada a este evento todavía.</p>
            )}
            <div className="space-y-2 mb-5">
              {data.taggedPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3 rounded-lg border border-bdr px-4 py-2.5">
                  <p className="text-sm text-foreground">{post.title}</p>
                  <form action={tagPostToEvent}>
                    <input type="hidden" name="post_id" value={post.id} />
                    <input type="hidden" name="event_slug" value="" />
                    <button type="submit" className="btn text-xs">Quitar del evento</button>
                  </form>
                </div>
              ))}
            </div>

            <p className="text-sm font-medium text-foreground mb-2">Etiquetar una publicación reciente</p>
            <div className="space-y-2">
              {data.recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3 rounded-lg border border-bdr px-4 py-2.5">
                  <p className="text-sm text-muted">{post.title}</p>
                  <form action={tagPostToEvent}>
                    <input type="hidden" name="post_id" value={post.id} />
                    <input type="hidden" name="event_slug" value={slug} />
                    <button type="submit" className="btn text-xs">Asociar a este evento</button>
                  </form>
                </div>
              ))}
              {data.recentPosts.length === 0 && (
                <p className="text-sm text-muted">No hay publicaciones recientes sin etiquetar.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
