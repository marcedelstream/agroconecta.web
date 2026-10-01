import Link from 'next/link'
import { SERVICES } from '@/lib/services-data'
import { WHATSAPP_URL } from '@/lib/social-links'

// Servicios de Agroconecta en la portada: la web también es vidriera para generar contactos.
export function ServicesBlock() {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <p className="text-lime text-xs font-bold uppercase tracking-[0.2em]">Servicios</p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground leading-tight tracking-tight mt-3">Trabajemos juntos</h2>
          <p className="text-muted text-lg mt-2">Consultoría, comunicación y tecnología para el agro, con el equipo de Agroconecta.</p>
        </div>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex self-start md:self-auto rounded-full bg-whatsapp text-white font-bold px-5 py-3 hover:opacity-90 transition-opacity">
          Escribinos por WhatsApp
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link key={s.id} href={`/servicios/${s.id}`} className="card p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display font-bold text-lg text-foreground">{s.label}</h3>
            <p className="text-muted text-sm mt-2 leading-relaxed line-clamp-3">{s.description}</p>
            <span className="inline-block text-sm font-bold text-lime mt-3">Consultar →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
