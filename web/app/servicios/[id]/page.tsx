import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LeadForm } from '@/components/site/LeadForm'
import { SERVICES } from '@/lib/services-data'
import { WHATSAPP_URL } from '@/lib/social-links'

interface Props {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const service = SERVICES.find((s) => s.id === id)
  return service ? { title: service.label, description: service.description, alternates: { canonical: `/servicios/${service.id}` } } : {}
}

export default async function ServicioPage({ params }: Props) {
  const { id } = await params
  const service = SERVICES.find((s) => s.id === id)
  if (!service) notFound()

  return (
    <>
      <Header />
      <main className="site-container py-10 md:py-16 max-w-5xl">
        <Link href="/servicios" className="text-sm font-semibold text-muted hover:text-foreground">← Servicios</Link>
        <div className="grid gap-8 md:grid-cols-2 mt-6 items-start">
          <div>
            <p className="text-lime text-xs font-bold uppercase tracking-[0.2em]">Servicio de Agroconecta</p>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-foreground leading-tight tracking-tight mt-3">{service.label}</h1>
            <p className="text-muted text-lg mt-4 leading-relaxed">{service.description}</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex mt-6 rounded-full bg-whatsapp text-white font-bold px-5 py-3 hover:opacity-90 transition-opacity">
              Consultar por WhatsApp
            </a>
          </div>
          <LeadForm type={service.id} submitLabel="Pedir que me contacten" />
        </div>
      </main>
      <Footer />
    </>
  )
}
