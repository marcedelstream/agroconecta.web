import Link from 'next/link'

const MODULES = [
  { name: 'Eventos', description: 'Agenda y cobertura de encuentros del agro.', href: '/ecosistema' },
  { name: 'Videos y remates', description: 'Contenido audiovisual, transmisiones y remates destacados.', href: '/' },
  { name: 'Biblioteca', description: 'Materiales técnicos, revistas y documentos para consulta.', href: '/ecosistema' },
  { name: 'Aliados', description: 'Organizaciones, medios e instituciones conectadas al ecosistema.', href: '/ecosistema' },
]

export function HomeSidebar() {
  return (
    <div className="space-y-4">
      <section className="card p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-lime text-[11px] font-semibold uppercase tracking-[0.18em]">App Agroconecta</p>
            <h2 className="font-display font-semibold text-lg text-foreground mt-1">Módulos activos</h2>
          </div>
          <Link href="/ecosistema" className="text-xs font-semibold text-lime hover:text-lime-dark transition-colors">
            Ver todo
          </Link>
        </div>

        <div className="space-y-3">
          {MODULES.map((item) => (
            <Link key={item.name} href={item.href} className="block rounded-xl border border-bdr bg-secondary/45 p-4 hover:border-lime/40 transition-colors">
              <h3 className="font-display font-semibold text-sm text-foreground">{item.name}</h3>
              <p className="text-muted text-xs leading-relaxed mt-2">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-lime/25 bg-lime/10 p-5">
        <p className="text-lime text-[11px] font-semibold uppercase tracking-[0.18em] mb-2">Comunidad</p>
        <h2 className="font-display font-semibold text-lg text-foreground">Una red para el agro paraguayo</h2>
        <p className="text-muted text-sm leading-relaxed mt-2">
          La web acompaña a la app móvil con información pública, precios, instituciones y acceso al ecosistema.
        </p>
      </section>
    </div>
  )
}
