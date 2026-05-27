import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Ecosistema Agroconecta',
  description: 'Proyectos y productos digitales conectados al sector agropecuario paraguayo.',
  alternates: {
    canonical: '/ecosistema',
  },
}

const ECOSYSTEM_ITEMS = [
  {
    name: 'Eventosagropy',
    category: 'Eventos',
    status: 'Activo',
    description: 'Agenda, difusión y cobertura de eventos agropecuarios en Paraguay.',
  },
  {
    name: 'Agrojuego',
    category: 'Experiencias',
    status: 'Activo',
    description: 'Activaciones digitales, dinámicas y juegos para marcas del sector.',
  },
  {
    name: 'Agroconecta',
    category: 'Noticias',
    status: 'Portal',
    description: 'Información segmentada, publicaciones institucionales y remates destacados.',
  },
  {
    name: 'Próximos lanzamientos',
    category: 'Ecosistema',
    status: 'En preparación',
    description: 'Nuevas herramientas conectadas a la comunidad agropecuaria.',
  },
]

export default function EcosistemaPage() {
  return (
    <>
      <Header />

      <main className="site-container py-8 md:py-10">
        <section className="mb-8">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Ecosistema
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight">
            Ecosistema Agroconecta
          </h1>
          <p className="text-muted text-base mt-3 max-w-2xl">
            Proyectos y productos digitales conectados al sector agropecuario paraguayo.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ECOSYSTEM_ITEMS.map((item) => (
            <article key={item.name} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-lime text-xs font-semibold uppercase tracking-[0.16em]">
                    {item.category}
                  </span>
                  <h2 className="font-display font-semibold text-xl text-foreground mt-2">
                    {item.name}
                  </h2>
                </div>
                <span className="badge bg-lime/15 text-lime text-[11px] shrink-0">
                  {item.status}
                </span>
              </div>
              <p className="text-muted text-sm leading-relaxed">{item.description}</p>
            </article>
          ))}
        </section>

        <div className="mt-8">
          <Link href="/" className="btn">
            Volver a noticias
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
