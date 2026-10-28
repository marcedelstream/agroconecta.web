import Image from 'next/image'
import { COMING_SOON, KARAI_PARTNERS } from '@/lib/karai/landing-content'

export function PartnersSection() {
  return (
    <section aria-labelledby="fuentes" className="pb-12">
      <h2 id="fuentes" className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em]">Fuentes aliadas</h2>
      <p className="text-[14px] leading-relaxed font-medium text-[var(--k-muted)] mt-1.5 mb-5 max-w-2xl">
        Gremios y organizaciones que aportan su material para que Karai responda con información confiable y citada.
      </p>
      {KARAI_PARTNERS.length === 0 ? (
        <div className="border border-dashed border-[var(--k-border-strong)] rounded-2xl px-5 py-8 text-center">
          <p className="text-[14px] font-semibold">Estamos sumando a los primeros gremios.</p>
          <p className="text-[13px] font-medium text-[var(--k-muted-2)] mt-1">
            ¿Tu organización quiere ser fuente de Karai? <a href="#organizaciones" className="text-[var(--k-lime)] hover:text-[var(--k-lime-hover)] font-semibold">Escribinos</a>.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {KARAI_PARTNERS.map((p) => {
            const logo = (
              <Image src={p.logoUrl} alt={p.name} width={160} height={64} className="max-h-12 w-auto object-contain" />
            )
            return (
              <li key={p.name} className="flex items-center justify-center h-24 bg-white border border-[var(--k-border)] rounded-2xl p-4">
                {p.website ? <a href={p.website} target="_blank" rel="noopener noreferrer">{logo}</a> : logo}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function ComingSoonSection() {
  return (
    <section aria-labelledby="viene" className="pb-14">
      <h2 id="viene" className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em] mb-5">Lo que viene</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COMING_SOON.map((item) => (
          <article key={item.title} className="bg-[var(--k-card)] border border-[var(--k-border)] rounded-2xl p-5">
            <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[var(--k-lime-text)] bg-[var(--k-lime-bg)] border border-[var(--k-lime-border)] rounded-full px-2.5 py-0.5">
              Próximamente
            </span>
            <h3 className="text-[15px] font-bold mt-3">{item.title}</h3>
            <p className="text-[13.5px] leading-relaxed font-medium text-[var(--k-muted)] mt-1.5">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
