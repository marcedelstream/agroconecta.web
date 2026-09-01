import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WHATSAPP_URL } from '@/lib/social-links'

export const metadata: Metadata = {
  title: 'Descargá la app',
  description: 'La app de Agroconecta está en revisión en las tiendas. Enterate apenas esté disponible para descargar.',
  alternates: { canonical: '/descargar' },
}

const FEATURES = [
  { title: 'Noticias segmentadas', description: 'Lo que pasa en el agro paraguayo, filtrado por tu profesión y tu departamento.' },
  { title: 'Precios al instante', description: 'Ganadería en guaraníes, commodities en dólares, actualizados.' },
  { title: 'Karai, tu asistente', description: 'Consultá precios, noticias y eventos, y llevá los datos de tu finca, todo por chat.' },
  { title: 'Eventos del sector', description: 'Agenda completa de ferias, congresos y jornadas técnicas, con recordatorios.' },
]

export default function DescargarPage() {
  return (
    <>
      <Header />

      <main className="site-container py-10 md:py-16">
        <section className="max-w-2xl mx-auto text-center">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">Descargá la app</p>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground leading-tight">
            Agroconecta ya casi está en tu celular
          </h1>
          <p className="text-muted text-base md:text-lg mt-4 leading-relaxed">
            La app está en revisión en Google Play y App Store. Mientras tanto, dejanos tu WhatsApp y te
            avisamos apenas esté lista para descargar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <span className="badge bg-secondary text-muted border border-bdr px-4 py-2">Google Play — muy pronto</span>
            <span className="badge bg-secondary text-muted border border-bdr px-4 py-2">App Store — muy pronto</span>
          </div>

          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 inline-flex">
            Avisenme cuando esté disponible
          </a>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-14 max-w-3xl mx-auto">
          {FEATURES.map((f) => (
            <article key={f.title} className="card p-5">
              <h2 className="font-display font-semibold text-lg text-foreground">{f.title}</h2>
              <p className="text-muted text-sm mt-2 leading-relaxed">{f.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-lime/25 bg-lime/10 p-6 max-w-3xl mx-auto text-center">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-2">Mientras tanto</p>
          <h2 className="font-display font-semibold text-xl text-foreground">Probá a Karai desde el navegador</h2>
          <p className="text-muted text-sm mt-2 max-w-xl mx-auto">
            Karai, el asistente de Agroconecta, ya está disponible para miembros en la web — no hace falta
            esperar a la app.
          </p>
          <a href="https://karai.agroconecta.com.py" className="btn-primary mt-4 inline-flex">
            Ir a Karai
          </a>
        </section>
      </main>

      <Footer />
    </>
  )
}
