import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Ecosistema Agroconecta',
  description: 'Noticias, precios, eventos, videos, biblioteca y aliados conectados al sector agropecuario paraguayo.',
  alternates: { canonical: '/ecosistema' },
}

const ECOSYSTEM_ITEMS = [
  { name: 'Noticias segmentadas', category: 'Información', status: 'Activo', description: 'Publicaciones del sector, instituciones y organizaciones verificadas en un solo feed.' },
  { name: 'Precios de mercado', category: 'Mercados', status: 'Activo', description: 'Referencias ganaderas en PYG y commodities internacionales en USD.' },
  { name: 'Eventosagropy', category: 'Eventos', status: 'Activo', description: 'Agenda, difusión y cobertura de eventos agropecuarios en Paraguay.' },
  { name: 'Videos y remates', category: 'Streaming', status: 'Activo', description: 'Transmisiones, remates, videos institucionales y contenidos audiovisuales.' },
  { name: 'Biblioteca digital', category: 'Conocimiento', status: 'Activo', description: 'Manuales, revistas y documentos técnicos para guardar y consultar desde la app.' },
  { name: 'Directorio de aliados', category: 'Comunidad', status: 'Activo', description: 'Medios, gremios, empresas e instituciones que forman parte del ecosistema.' },
]

export default function EcosistemaPage() {
  return (
    <>
      <Header />

      <main className="site-container py-8 md:py-10">
        <section className="mb-8 max-w-3xl">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">Ecosistema</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight">
            Una plataforma conectada para el agro paraguayo
          </h1>
          <p className="text-muted text-base mt-3 leading-relaxed">
            Agroconecta une información, mercado, eventos, contenido audiovisual y comunidad en una experiencia pensada para productores, profesionales, marcas e instituciones.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ECOSYSTEM_ITEMS.map((item) => (
            <article key={item.name} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-lime text-xs font-semibold uppercase tracking-[0.16em]">{item.category}</span>
                  <h2 className="font-display font-semibold text-xl text-foreground mt-2">{item.name}</h2>
                </div>
                <span className="badge bg-lime/15 text-lime text-[11px] shrink-0">{item.status}</span>
              </div>
              <p className="text-muted text-sm leading-relaxed">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-lime/25 bg-lime/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-2">Mobile first</p>
            <h2 className="font-display font-semibold text-xl text-foreground">La experiencia completa vive en la app</h2>
            <p className="text-muted text-sm mt-2 max-w-2xl">La web funciona como portal público; la app concentra personalización, perfil, notificaciones, biblioteca y navegación diaria.</p>
          </div>
          <Link href="/" className="btn-primary shrink-0">Ver noticias</Link>
        </section>
      </main>

      <Footer />
    </>
  )
}
