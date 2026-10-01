import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LeadForm } from '@/components/site/LeadForm'

export const metadata: Metadata = {
  title: 'Plan para organizaciones',
  description: 'Gremios, medios, empresas e instituciones: publicá tus noticias y videos en el feed de Agroconecta y llegá a todo el agro paraguayo.',
  alternates: { canonical: '/organizaciones' },
}

// Monto del plan. Se muestra solo en la web: en la app no hay precio ni compra.
const PRICE = '₲ 349.000'

const FEATURES = [
  { title: 'Publicás en el feed', text: 'Tus noticias y videos llegan a productores y profesionales según su rubro y departamento. Nuestro equipo las revisa antes de salir.' },
  { title: 'Seguidores propios', text: 'La gente sigue a tu organización y ve más de lo que publicás, con tu logo y tu perfil.' },
  { title: 'Resultados', text: 'Sabé cuántas personas vieron, guardaron y compartieron tus publicaciones.' },
  { title: 'Todo desde la app', text: 'Cargás desde el celular con el botón "+", sin depender de nadie.' },
]

export default function OrganizacionesPage() {
  return (
    <>
      <Header />
      <main className="site-container py-10 md:py-16 max-w-5xl">
        <p className="text-lime text-xs font-bold uppercase tracking-[0.2em]">Para organizaciones</p>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-foreground leading-tight tracking-tight mt-3 max-w-3xl">
          Llegá a todo el agro paraguayo con tu organización
        </h1>
        <p className="text-muted text-lg mt-4 max-w-2xl">Para gremios, medios, cooperativas, empresas e instituciones del sector.</p>

        <div className="grid gap-4 sm:grid-cols-2 mt-10">
          {FEATURES.map((f) => (
            <article key={f.title} className="card p-6">
              <h2 className="font-display font-bold text-lg text-foreground">{f.title}</h2>
              <p className="text-muted mt-2 leading-relaxed">{f.text}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-6 md:grid-cols-2 mt-10 items-start">
          <div className="relative overflow-hidden rounded-[28px] bg-navy text-white p-8">
            <div className="absolute -right-12 -top-16 w-44 h-44 rounded-full border-[20px] border-brand/90" aria-hidden />
            <p className="relative text-white/70 text-sm">Plan mensual</p>
            <p className="relative font-display font-extrabold text-4xl mt-1">{PRICE}<span className="text-base text-white/60 font-medium"> / mes</span></p>
            <p className="relative text-white/75 mt-3">Te acompañamos a configurar el perfil de tu organización y a cargar tus primeras publicaciones.</p>
          </div>
          <LeadForm type="suscripcion_organizacion_web" submitLabel="Quiero publicar en Agroconecta" askOrg messagePlaceholder="¿Qué tipo de contenido publicarían? (opcional)" />
        </section>
      </main>
      <Footer />
    </>
  )
}
