import Link from 'next/link'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppCta } from '@/components/site/AppCta'
import { storeUrlForUserAgent } from '@/lib/store-links'

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

// Desde el celular, /descargar lleva directo a la tienda que corresponde (Android → Google Play,
// iPhone → App Store); en la computadora se ve la página con los dos botones.
export default async function DescargarPage() {
  const storeUrl = storeUrlForUserAgent((await headers()).get('user-agent') ?? '')
  if (storeUrl) redirect(storeUrl)

  return (
    <>
      <Header />
      <main className="site-container py-10 md:py-16 space-y-12">
        <AppCta
          title="Todo el agro paraguayo, en tu celular"
          body="Agroconecta es gratis. Descargala, elegí tus intereses y empezá a ver lo que más te sirve."
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="card p-6">
              <h2 className="font-display font-bold text-lg text-foreground">{f.title}</h2>
              <p className="text-muted mt-2 leading-relaxed">{f.text}</p>
            </article>
          ))}
        </section>

        {/* Pedido 2026-11-11: Google revisa esta página (pantalla de consentimiento del login) y pide que explique para
            qué es la app y qué hace con los datos de la cuenta de Google. */}
        <section className="card p-6 md:p-8 max-w-3xl mx-auto space-y-3">
          <h2 className="font-display font-bold text-xl text-foreground">Qué es Agroconecta</h2>
          <p className="text-muted leading-relaxed">
            Agroconecta es una app gratuita para productores, profesionales y empresas del agro en Paraguay. Reúne en
            un solo lugar las noticias del sector, los precios del ganado y de los granos, la agenda de eventos y
            remates, cursos, empleos y a Karai, un asistente con inteligencia artificial que responde consultas del agro.
          </p>
          <h2 className="font-display font-bold text-xl text-foreground pt-2">Cómo usamos tu cuenta de Google</h2>
          <p className="text-muted leading-relaxed">
            Podés crear tu cuenta con Google para no tener que inventar una contraseña. De tu cuenta de Google solo
            recibimos tu nombre, tu correo y tu foto de perfil, y los usamos únicamente para identificarte en la app y
            personalizar lo que ves. No accedemos a tus correos, contactos ni archivos, y no vendemos ni compartimos esos
            datos. Más detalle en la{' '}
            <Link href="/politica" className="font-semibold text-lime hover:text-lime-dark">Política de privacidad</Link>
            {' '}y las{' '}
            <Link href="/terminos" className="font-semibold text-lime hover:text-lime-dark">Condiciones del servicio</Link>.
          </p>
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
