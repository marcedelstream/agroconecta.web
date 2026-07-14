import Image from 'next/image'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Quiénes somos',
  description: 'Conocé a Agroconecta, sus fundadores y la visión detrás del ecosistema digital agropecuario.',
  alternates: {
    canonical: '/quienes-somos',
  },
}

const FOUNDERS = [
  {
    name: 'Marcelo Escobar',
    role: 'Co-fundador y Director de Tecnología',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1733840528665-XXvTjaen2eV0PgjrVk2FqdPzy3XVoD.jpeg',
    bio: 'Lidera el desarrollo tecnológico y la visión estratégica de Agroconecta, conectando producto, operación y modelo de negocio para construir herramientas útiles para el sector agropecuario paraguayo.',
  },
  {
    name: 'Marlene Fernández',
    role: 'Co-fundadora y Directora de Comunicación',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-03-23%20at%2010.53.16-Q322FxX2EnEsc2L66VwEACBjsTqvsp.jpeg',
    bio: 'Encabeza la estrategia de comunicación y contenidos, acercando el ecosistema a productores, instituciones, marcas y profesionales que necesitan información clara y segmentada.',
  },
  {
    name: 'Fiorella Riveros',
    role: 'Directora de Sostenibilidad',
    image: '/fiorella-riveros.jpeg',
    bio: 'Lidera la visión socioambiental y de sostenibilidad, conectando gestión ambiental, comunicación e innovación para desarrollar soluciones que respondan a los desafíos actuales y futuros.',
  },
]

const VALUES = [
  {
    number: '01',
    title: 'Tecnología con propósito',
    description: 'Construimos herramientas para resolver problemas reales del agro, con foco en comunicación, difusión y conexión.',
  },
  {
    number: '02',
    title: 'Pioneros por convicción',
    description: 'Impulsamos soluciones digitales propias para un sector que merecía plataformas pensadas desde Paraguay.',
  },
  {
    number: '03',
    title: 'Ecosistema, no agencia',
    description: 'Creamos productos conectados entre sí, con visión de largo plazo y compromiso directo con el resultado.',
  },
]

export default function QuienesSomosPage() {
  return (
    <>
      <Header />

      <main>
        <section className="site-container py-10 md:py-14">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Quiénes somos
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-end">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground leading-tight max-w-3xl">
                Los fundadores del ecosistema digital agropecuario de Paraguay
              </h1>
              <p className="text-muted text-base md:text-lg mt-4 max-w-2xl leading-relaxed">
                Agroconecta nace para crear tecnología propia para el campo paraguayo: plataformas simples, útiles y pensadas desde las necesidades reales del sector.
              </p>
            </div>
            <div className="rounded-2xl border border-lime/25 bg-lime/10 p-5">
              <p className="text-lime text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">
                Nuestra misión
              </p>
              <p className="text-foreground font-display font-semibold text-xl leading-snug">
                Tecnología construida desde adentro del campo.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-bdr bg-secondary/35">
          <div className="site-container py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                Visión
              </p>
              <h2 className="font-display font-semibold text-2xl md:text-3xl text-foreground">
                Soluciones digitales propias para el agro
              </h2>
            </div>
            <div className="space-y-4 text-muted text-sm md:text-base leading-relaxed">
              <p>
                El sector agropecuario paraguayo es uno de los motores de la economía nacional. Agroconecta busca darle herramientas digitales diseñadas para su forma de trabajar, comunicarse y tomar decisiones.
              </p>
              <p>
                Desarrollamos productos que ayudan a ordenar la información, amplificar instituciones, acercar eventos y conectar mejor a productores, profesionales, marcas y organizaciones.
              </p>
            </div>
          </div>
        </section>

        <section className="site-container py-10 md:py-14">
          <div className="mb-7">
            <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              Equipo
            </p>
            <h2 className="font-display font-semibold text-2xl md:text-3xl text-foreground">
              Equipo directivo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FOUNDERS.map((founder) => (
              <article key={founder.name} className="card p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-lime/35 shrink-0 bg-secondary">
                    <Image
                      src={founder.image}
                      alt={`Foto de ${founder.name}`}
                      fill
                      sizes="64px"
                      className="object-cover grayscale"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground">{founder.name}</h3>
                    <p className="text-lime text-xs font-semibold mt-1">{founder.role}</p>
                  </div>
                </div>
                <p className="text-muted text-sm leading-relaxed">{founder.bio}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="site-container pb-12 md:pb-16">
          <div className="mb-7">
            <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              Valores
            </p>
            <h2 className="font-display font-semibold text-2xl md:text-3xl text-foreground">
              Lo que nos guía
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VALUES.map((value) => (
              <article key={value.number} className="card p-5">
                <span className="text-lime text-xs font-semibold tracking-[0.18em]">{value.number}</span>
                <h3 className="font-display font-semibold text-lg text-foreground mt-3">{value.title}</h3>
                <p className="text-muted text-sm leading-relaxed mt-2">{value.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
