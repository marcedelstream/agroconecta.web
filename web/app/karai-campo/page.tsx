import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WHATSAPP_URL } from '@/lib/social-links'
import { RequestForm } from './RequestForm'

export const metadata: Metadata = {
  title: 'KARAI Campo',
  description: 'Karai, el asistente de Agroconecta, a la medida de tu establecimiento: conoce tu campo y te responde con tus números.',
  alternates: { canonical: '/karai-campo' },
}

// Monto de la membresía. Se muestra solo en la web: en la app no hay precio ni compra.
const PRICE = '₲ 149.000'

const BENEFITS = [
  { title: 'Mi campo', text: 'Cargás tus hectáreas, tu ganado y tus cultivos una vez, y Karai los tiene en cuenta en cada respuesta. Los datos son solo para la IA: no se muestran ni se venden.' },
  { title: 'Más consultas', text: 'Hasta 15 consultas por día (la versión gratis tiene 5).' },
  { title: 'Miembro de Agroconecta', text: 'Beneficios especiales para miembros, que vamos a ir sumando.' },
]

export default function KaraiCampoPage() {
  return (
    <>
      <Header />
      <main className="site-container py-10 md:py-14 max-w-3xl">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">KARAI Campo</p>
        <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground leading-tight">Karai, a la medida de tu establecimiento</h1>
        <p className="text-muted text-base md:text-lg mt-4 leading-relaxed">
          La versión completa de Karai para productores: conoce tu campo y te responde con tus números, desde la app de
          Agroconecta.
        </p>

        <section className="grid gap-4 sm:grid-cols-3 mt-10">
          {BENEFITS.map((b) => (
            <article key={b.title} className="card p-5">
              <h2 className="font-display font-semibold text-lg text-foreground">{b.title}</h2>
              <p className="text-muted text-sm mt-2 leading-relaxed">{b.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 items-start">
          <div className="rounded-2xl border border-lime/25 bg-lime/10 p-6">
            <p className="text-sm text-muted">Membresía mensual</p>
            <p className="font-display font-bold text-4xl text-foreground mt-1">{PRICE}<span className="text-base text-muted font-normal"> / mes</span></p>
            <p className="text-sm text-muted mt-3">Se activa en la misma cuenta con la que entrás a la app. Podés cancelar cuando quieras.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-5 inline-flex">Consultar por WhatsApp</a>
          </div>
          <RequestForm />
        </section>
      </main>
      <Footer />
    </>
  )
}
