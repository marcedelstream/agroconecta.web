import Image from 'next/image'
import Link from 'next/link'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/store-links'

// Primer bloque de la portada: invitar a descargar la app. El botón principal va a /descargar, que en
// el celular rebota directo a la tienda que corresponde; abajo quedan las dos tiendas a mano.
export function AppHero() {
  return (
    <section className="relative overflow-hidden bg-brand">
      <div className="absolute -right-24 -top-32 w-96 h-96 rounded-full border-[40px] border-navy/10" aria-hidden />
      <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-white/15" aria-hidden />
      <div className="site-container relative py-12 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-14">
        <Image
          src="/icon-512.png"
          alt="Ícono de la app Agroconecta"
          width={160}
          height={160}
          priority
          className="w-24 h-24 md:w-40 md:h-40 rounded-[28%] shadow-[0_18px_40px_rgba(11,22,32,0.25)] shrink-0"
        />
        <div className="text-center md:text-left">
          <p className="text-navy/70 text-xs md:text-sm font-bold uppercase tracking-[0.22em]">Ya disponible en Android y iPhone</p>
          <h2 className="font-display font-extrabold text-navy text-3xl md:text-5xl leading-[1.05] tracking-tight mt-3 max-w-2xl">
            Descargá la app de Agroconecta
          </h2>
          <p className="text-navy/80 text-base md:text-lg mt-3 max-w-xl leading-relaxed">
            Noticias, precios, eventos, remates y Karai en un solo lugar. Es gratis.
          </p>
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 mt-7">
            <Link href="/descargar" className="inline-flex items-center justify-center rounded-full bg-navy text-white font-bold text-lg px-8 h-14 hover:bg-navy/90 transition-colors">
              Descargar gratis
            </Link>
          </div>
          <p className="text-navy/70 text-sm mt-4">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline-offset-4 hover:underline">Google Play</a>
            {' · '}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline-offset-4 hover:underline">App Store</a>
          </p>
        </div>
      </div>
    </section>
  )
}
