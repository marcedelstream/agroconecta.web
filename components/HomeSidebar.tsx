import Link from 'next/link'

const ECOSYSTEM_ITEMS = [
  {
    name: 'Eventosagropy',
    description: 'Agenda y cobertura de eventos del agro paraguayo.',
    status: 'Activo',
    href: '/ecosistema',
  },
  {
    name: 'Agrojuego',
    description: 'Experiencias interactivas para marcas y productores.',
    status: 'Activo',
    href: '/ecosistema',
  },
  {
    name: 'Agroconecta',
    description: 'Noticias segmentadas, asociaciones y remates destacados.',
    status: 'Portal',
    href: '/ecosistema',
  },
]

export function HomeSidebar() {
  return (
    <div className="space-y-4">
      <section className="card p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-lime text-[11px] font-semibold uppercase tracking-[0.18em]">
              Ecosistema
            </p>
            <h2 className="font-display font-semibold text-lg text-foreground mt-1">
              Proyectos activos
            </h2>
          </div>
          <Link href="/ecosistema" className="text-xs font-semibold text-lime hover:text-lime-dark transition-colors">
            Ver todo
          </Link>
        </div>

        <div className="space-y-3">
          {ECOSYSTEM_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-xl border border-bdr bg-secondary/45 p-4 hover:border-lime/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display font-semibold text-sm text-foreground">{item.name}</h3>
                <span className="badge bg-lime/15 text-lime text-[10px] shrink-0">{item.status}</span>
              </div>
              <p className="text-muted text-xs leading-relaxed mt-2">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-lime/25 bg-lime/10 p-5">
        <p className="text-lime text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">
          Comunidad
        </p>
        <h2 className="font-display font-semibold text-lg text-foreground">
          Información para productores reales
        </h2>
        <p className="text-muted text-sm leading-relaxed mt-2">
          El portal acompaña a la app mobile con noticias, instituciones y servicios del sector.
        </p>
      </section>
    </div>
  )
}
