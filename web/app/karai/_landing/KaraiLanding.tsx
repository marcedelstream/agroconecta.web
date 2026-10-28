import Image from 'next/image'
import Link from 'next/link'
import { EXAMPLE_QUESTIONS, TODAY_FEATURES } from '@/lib/karai/landing-content'
import { ComingSoonSection, PartnersSection } from './LandingSections'
import { OrgLeadForm } from './OrgLeadForm'

const LOGIN_PATH = '/karai/login'

// El login vuelve a /karai?q=… y el chat manda la pregunta apenas abre.
function questionHref(question: string): string {
  const target = `/karai?q=${encodeURIComponent(question)}`
  return `${LOGIN_PATH}?redirect=${encodeURIComponent(target)}`
}

// Vidriera para quien llega sin sesión (directivos de gremios, cooperativas, empresas): qué es Karai
// hoy, qué va a ser, y cómo sumarse. Con sesión, /karai muestra directamente el chat.
export function KaraiLanding() {
  return (
    <div className="min-h-screen bg-[var(--k-bg)] text-[var(--k-text)]">
      <header className="mx-auto max-w-5xl flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Image src="/karai-avatar.png" alt="" width={32} height={32} className="rounded-[10px] block" />
          <span className="text-[15px] font-extrabold">Karai</span>
          <span className="hidden sm:inline text-xs font-medium text-[var(--k-muted-2)]">· de Agroconecta</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={LOGIN_PATH} className="text-[13px] font-semibold text-[var(--k-muted)] hover:text-[var(--k-text)] px-2 py-1.5">
            Ingresar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <section className="pt-8 sm:pt-14 pb-10 flex flex-col items-center text-center gap-5">
          <Image src="/karai-avatar.png" alt="Karai" width={72} height={72} className="rounded-[22px] block" priority />
          <h1 className="text-[30px] sm:text-[44px] leading-[1.1] font-extrabold tracking-[-0.03em] max-w-3xl text-balance">
            La inteligencia artificial del agro paraguayo.
          </h1>
          <p className="text-[15px] sm:text-[17px] leading-relaxed font-medium text-[var(--k-muted)] max-w-2xl text-balance">
            Karai responde en segundos sobre precios, remates, sanidad, cultivos y el día a día del campo, con datos de
            Agroconecta y de los gremios que se suman como fuentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <Link
              href={`${LOGIN_PATH}?redirect=%2Fkarai`}
              className="bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] text-[var(--k-on-lime)] rounded-xl px-6 py-3 text-sm font-bold transition-colors text-center"
            >
              Probar Karai gratis
            </Link>
            <a
              href="#organizaciones"
              className="border border-[var(--k-border-strong)] hover:border-[var(--k-border-hover)] text-[var(--k-text)] rounded-xl px-6 py-3 text-sm font-semibold transition-colors text-center"
            >
              Soy una organización
            </a>
          </div>
          <p className="text-xs font-medium text-[var(--k-muted-2)]">5 consultas gratis por día · entrás con Google o con tu email</p>
        </section>

        <section aria-labelledby="ejemplos" className="pb-12">
          <h2 id="ejemplos" className="text-xs font-bold uppercase tracking-wider text-[var(--k-muted-2)] text-center mb-4">
            Probá con una pregunta
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_QUESTIONS.map((q) => (
              <Link
                key={q}
                href={questionHref(q)}
                className="group flex items-center justify-between gap-3 bg-[var(--k-card)] border border-[var(--k-border-strong)] hover:border-[var(--k-lime)] rounded-2xl px-4 py-3.5 text-[14px] font-semibold transition-colors"
              >
                <span>{q}</span>
                <span aria-hidden className="text-[var(--k-muted-3)] group-hover:text-[var(--k-lime)] transition-colors">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="hoy" className="pb-12">
          <h2 id="hoy" className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em] mb-5">Lo que Karai ya hace</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TODAY_FEATURES.map((f) => (
              <article key={f.title} className="bg-[var(--k-card)] border border-[var(--k-border)] rounded-2xl p-5">
                <h3 className="text-[15px] font-bold">{f.title}</h3>
                <p className="text-[13.5px] leading-relaxed font-medium text-[var(--k-muted)] mt-1.5">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <PartnersSection />
        <ComingSoonSection />

        <section id="organizaciones" aria-labelledby="sumate" className="scroll-mt-6 grid gap-6 md:grid-cols-2 items-start">
          <div className="flex flex-col gap-3">
            <h2 id="sumate" className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em]">Sumá a tu organización</h2>
            <p className="text-[15px] leading-relaxed font-medium text-[var(--k-muted)]">
              Si tu gremio, cooperativa o empresa tiene material técnico, manuales o datos para el productor, Karai puede
              usarlos como fuente y citarlos en cada respuesta. También estamos armando Karai Teams para que cada
              organización tenga su propio asistente.
            </p>
            <p className="text-[13.5px] font-medium text-[var(--k-muted-2)]">Dejanos tus datos y te contactamos para una reunión.</p>
          </div>
          <OrgLeadForm />
        </section>
      </main>

      <footer className="border-t border-[var(--k-border)] py-6 text-center text-xs font-medium text-[var(--k-muted-3)]">
        Karai es un servicio de <a href="https://agroconecta.com.py" className="hover:text-[var(--k-text)]">Agroconecta</a>
      </footer>
    </div>
  )
}
