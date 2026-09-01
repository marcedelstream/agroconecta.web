import Image from 'next/image'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createSupabaseServer } from '@/lib/supabase-server'
import { ALLY_CATEGORY_LABELS, type OrganizationRow } from '@/lib/types'
import { WHATSAPP_URL } from '@/lib/social-links'

export const metadata: Metadata = {
  title: 'Aliados de Agroconecta',
  description: 'Medios, gremios, empresas e instituciones que forman parte del programa de Aliados de la Transformación Digital del Agro.',
  alternates: { canonical: '/aliados' },
}

async function loadAllies() {
  try {
    const supabase = await createSupabaseServer()
    const { data, error } = await supabase
      .from('organizations')
      .select('id,slug,name,description,type,commercial_status,plan_name,is_verified,logo_url,ally_plan,ally_category,ally_founder,contact_phone')
      .not('ally_plan', 'is', null)
      .eq('commercial_status', 'active')
      .order('name')

    if (error) return []
    return (data ?? []) as OrganizationRow[]
  } catch (error) {
    console.error('Aliados load failed', error)
    return []
  }
}

function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

export default async function AliadosPage() {
  const allies = await loadAllies()

  return (
    <>
      <Header />

      <main className="site-container py-8 md:py-10">
        <section className="mb-8 max-w-3xl">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">Aliados</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight">
            Organizaciones que impulsan la transformación digital del agro
          </h1>
          <p className="text-muted text-base mt-3 leading-relaxed">
            Medios, gremios, empresas e instituciones que acompañan el ecosistema Agroconecta como Aliados,
            con presencia y alcance dentro de la app y la comunidad del sector.
          </p>
        </section>

        {allies.length === 0 ? (
          <div className="card p-8 text-center text-muted text-sm">
            Todavía no hay Aliados publicados.
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allies.map((org) => (
              <article
                key={org.id}
                className={`card p-5 flex flex-col h-full ${org.ally_founder ? 'border-warning/40 bg-warning/5' : ''}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {org.logo_url ? (
                    <Image
                      src={org.logo_url}
                      alt={org.name}
                      width={48}
                      height={48}
                      className="rounded-lg w-12 h-12 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary border border-bdr flex items-center justify-center text-muted text-sm font-semibold shrink-0">
                      {org.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h2 className="font-display font-semibold text-base text-foreground truncate">{org.name}</h2>
                      {org.is_verified && (
                        <span title="Organización verificada" className="text-lime shrink-0">✓</span>
                      )}
                    </div>
                    {org.ally_category && (
                      <p className="text-muted text-xs mt-0.5">{ALLY_CATEGORY_LABELS[org.ally_category]}</p>
                    )}
                  </div>
                </div>

                {org.ally_plan && (
                  <div className="mb-3">
                    <span className="badge bg-lime/15 text-lime text-[11px]">Aliado</span>
                  </div>
                )}

                {org.description && (
                  <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-4">{org.description}</p>
                )}

                {org.contact_phone && (
                  <a
                    href={whatsappUrl(org.contact_phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn text-xs mt-auto self-start"
                  >
                    Contactar por WhatsApp
                  </a>
                )}
              </article>
            ))}
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-lime/25 bg-lime/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-2">Sumate</p>
            <h2 className="font-display font-semibold text-xl text-foreground">¿Querés que tu organización sea Aliada?</h2>
            <p className="text-muted text-sm mt-2 max-w-2xl">Escribinos y te contamos cómo funciona el programa de Aliados de la Transformación Digital del Agro.</p>
          </div>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
            Contactar
          </a>
        </section>
      </main>

      <Footer />
    </>
  )
}
