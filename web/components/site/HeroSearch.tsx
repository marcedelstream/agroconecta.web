import Link from 'next/link'

const SHORTCUTS = [
  { href: '/precios', label: 'Precio del ganado' },
  { href: '/explorar?tipo=evento', label: 'Eventos' },
  { href: '/explorar?tipo=remate', label: 'Remates' },
  { href: '/explorar?tipo=curso', label: 'Cursos' },
  { href: '/explorar?tipo=empleo', label: 'Empleos' },
  { href: '/karai', label: 'Preguntale a Karai' },
]

// Primer bloque de la portada: un buscador grande, como protagonista. Buscar lleva a /explorar.
export function HeroSearch() {
  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="absolute -left-24 -bottom-40 w-96 h-96 rounded-full border-[40px] border-brand/80" aria-hidden />
      <div className="absolute right-[-6rem] top-[-6rem] w-72 h-72 rounded-full bg-brand/10" aria-hidden />
      <div className="site-container relative py-16 md:py-28 text-center">
        <p className="text-brand text-xs md:text-sm font-bold uppercase tracking-[0.22em]">Agroconecta · Ecosistema digital del agro</p>
        <h1 className="font-display font-extrabold text-white text-4xl md:text-6xl leading-[1.05] tracking-tight mt-4 max-w-3xl mx-auto">
          ¿Qué buscás del agro paraguayo?
        </h1>
        <form action="/explorar" method="get" className="mt-8 md:mt-10 max-w-2xl mx-auto">
          <label className="flex items-center gap-3 rounded-full bg-white pl-6 pr-2 h-16 shadow-xl">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              name="q"
              placeholder="Remates de esta semana, curso de pasturas…"
              className="flex-1 min-w-0 bg-transparent outline-none text-lg text-navy placeholder:text-muted"
              aria-label="Buscar en Agroconecta"
            />
            <button type="submit" className="rounded-full bg-brand text-navy font-bold px-5 md:px-7 h-12 hover:bg-brand-dark transition-colors">
              Buscar
            </button>
          </label>
        </form>
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl mx-auto">
          {SHORTCUTS.map((s) => (
            <Link key={s.href} href={s.href} className="rounded-full border border-white/20 text-white/90 text-sm font-medium px-4 py-2 hover:bg-white/10 transition-colors">
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
