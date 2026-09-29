import Link from 'next/link'

const QUESTIONS = ['¿Cómo está el precio del novillo esta semana?', '¿Qué remates hay en Concepción?', '¿Qué curso me sirve para mejorar mis pasturas?']

// Karai en la portada: invita a probarlo gratis y presenta KARAI Campo (que se contrata en la web).
export function KaraiBlock() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-stretch">
      <div className="rounded-[28px] bg-surface border border-bdr p-8 md:p-10">
        <p className="text-lime text-xs font-bold uppercase tracking-[0.2em]">Karai · Asistente del agro</p>
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground leading-tight tracking-tight mt-3">
          Preguntale lo que necesites saber del agro
        </h2>
        <p className="text-muted text-lg mt-3 leading-relaxed">Karai responde con la información de Agroconecta: precios, noticias, eventos y más. Gratis, 5 consultas por día.</p>
        <ul className="mt-6 space-y-2">
          {QUESTIONS.map((q) => (
            <li key={q} className="rounded-2xl bg-bg px-4 py-3 text-foreground font-medium">“{q}”</li>
          ))}
        </ul>
        <Link href="/karai" className="btn-primary mt-6 px-6 py-3 text-base">Probar Karai</Link>
      </div>
      <div className="relative overflow-hidden rounded-[28px] bg-navy text-white p-8 md:p-10 flex flex-col">
        <div className="absolute -right-12 -top-16 w-48 h-48 rounded-full border-[22px] border-brand/90" aria-hidden />
        <p className="relative text-brand text-xs font-bold uppercase tracking-[0.2em]">KARAI Campo</p>
        <h3 className="relative font-display font-extrabold text-2xl md:text-3xl leading-tight mt-3 max-w-xs">Karai, a la medida de tu establecimiento</h3>
        <p className="relative text-white/75 mt-3 leading-relaxed">Cargás tus hectáreas, tu ganado y tus cultivos, y Karai te responde con tus números. Hasta 15 consultas por día.</p>
        <p className="relative font-display font-extrabold text-3xl mt-6">₲ 149.000<span className="text-base text-white/60 font-medium"> / mes</span></p>
        <Link href="/karai-campo" className="relative mt-6 inline-flex self-start rounded-full bg-brand text-navy font-bold px-6 py-3 hover:bg-brand-dark transition-colors">Quiero KARAI Campo</Link>
      </div>
    </section>
  )
}
