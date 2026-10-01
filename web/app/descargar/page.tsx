import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppCta } from '@/components/site/AppCta'
import { PLAY_STORE_URL } from '@/lib/store-links'
import { WHATSAPP_URL } from '@/lib/social-links'

export const metadata: Metadata = {
  title: 'Descargá la app',
  description: 'Descargá Agroconecta: noticias, precios, eventos, remates y Karai, todo el agro paraguayo en tu celular.',
  alternates: { canonical: '/descargar' },
}

const FEATURES = [
  { title: 'Un feed hecho para vos', text: 'Deslizá y enterate de todo el agro, ordenado según tu rubro y tu departamento.' },
  { title: 'Precios al día', text: 'Ganado en guaraníes y granos en dólares, con su variación.' },
  { title: 'Eventos y remates', text: 'Activá recordatorios y mirá las transmisiones en vivo.' },
  { title: 'Karai, tu asistente', text: 'Preguntale lo que necesites saber del agro, cuando quieras.' },
]

// Página de descarga: App Store ya publicada; Google Play aparece cuando PLAY_STORE_URL tenga el link.
export default function DescargarPage() {
  return (
    <>
      <Header />
      <main className="site-container py-10 md:py-16 space-y-12">
        <AppCta
          title="Todo el agro paraguayo, en tu celular"
          body="Agroconecta es gratis. Descargala, elegí tus intereses y empezá a ver lo que más te sirve."
        />

        {!PLAY_STORE_URL && (
          <p className="text-center text-muted">
            ¿Tenés Android? La app para Google Play sale muy pronto.{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-lime hover:text-lime-dark">
              Avisame por WhatsApp
            </a>
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="card p-6">
              <h2 className="font-display font-bold text-lg text-foreground">{f.title}</h2>
              <p className="text-muted mt-2 leading-relaxed">{f.text}</p>
            </article>
          ))}
        </section>

        <p className="text-center text-muted">
          ¿Querés probar Karai desde la computadora?{' '}
          <Link href="/karai" className="font-semibold text-lime hover:text-lime-dark">Abrí Karai en la web</Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
