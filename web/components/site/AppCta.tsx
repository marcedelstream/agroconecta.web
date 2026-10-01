import Link from 'next/link'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/store-links'

interface Props {
  title?: string
  body?: string
}

// Bloque "Descargá la app": el objetivo de toda la web es llevar gente a la app.
export function AppCta({
  title = 'Todo el agro, en tu bolsillo',
  body = 'Noticias, precios, eventos y remates en un feed hecho para vos, con recordatorios y Karai para consultar lo que necesites.',
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-navy text-white p-8 md:p-12">
      <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full border-[28px] border-brand/90" aria-hidden />
      <div className="relative max-w-xl">
        <p className="text-brand text-xs font-bold uppercase tracking-[0.2em]">La app de Agroconecta</p>
        <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mt-3">{title}</h2>
        <p className="text-white/75 text-base md:text-lg mt-3 leading-relaxed">{body}</p>
        <div className="flex flex-wrap gap-3 mt-7">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand text-navy font-bold px-5 py-3 hover:bg-brand-dark transition-colors">
            Descargar en App Store
          </a>
          {PLAY_STORE_URL ? (
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white text-navy font-bold px-5 py-3 hover:bg-white/90 transition-colors">
              Descargar en Google Play
            </a>
          ) : (
            <Link href="/descargar" className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white font-semibold px-5 py-3 hover:bg-white/10 transition-colors">
              Google Play — muy pronto
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
