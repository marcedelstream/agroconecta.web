// "La problemática": por qué existe Agroconecta. Primer borrador de texto, a revisar por Marce.
const PAINS = [
  {
    title: 'La información está desparramada',
    text: 'Grupos de WhatsApp, radios, páginas y redes: para saber qué pasa en el agro hay que buscar en diez lugares.',
  },
  {
    title: 'Los precios cuestan encontrarlos',
    text: 'El precio del ganado y de los granos cambia todos los días y casi nunca está a mano cuando lo necesitás.',
  },
  {
    title: 'Te enterás tarde de lo importante',
    text: 'Remates, ferias, capacitaciones y oportunidades de trabajo se pierden por no enterarse a tiempo.',
  },
]

export function ProblemBlock() {
  return (
    <section>
      <div className="max-w-2xl">
        <p className="text-lime text-xs font-bold uppercase tracking-[0.2em]">Por qué Agroconecta</p>
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground leading-tight tracking-tight mt-3">
          El agro paraguayo se mueve rápido. La información, no tanto.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        {PAINS.map((p, i) => (
          <article key={p.title} className="card p-6">
            <span className="inline-flex w-9 h-9 rounded-full bg-brand text-navy font-extrabold items-center justify-center">{i + 1}</span>
            <h3 className="font-display font-bold text-lg text-foreground mt-4">{p.title}</h3>
            <p className="text-muted mt-2 leading-relaxed">{p.text}</p>
          </article>
        ))}
      </div>
      <p className="font-display font-bold text-xl md:text-2xl text-foreground mt-8 max-w-3xl">
        Agroconecta lo junta y lo ordena para vos: <span className="text-lime">noticias, precios, eventos, remates, cursos y empleos</span>, según tu rubro y tu departamento.
      </p>
    </section>
  )
}
