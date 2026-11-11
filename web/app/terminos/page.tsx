import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Condiciones del servicio',
  description: 'Condiciones de uso de la app y la web de Agroconecta: tu cuenta, el contenido, Karai, puntos, publicidad y membresías.',
  alternates: {
    canonical: '/terminos',
  },
}

const UPDATED = '10 de noviembre de 2026'

const linkClass = 'text-lime hover:underline'
const soporte = <Link href="/soporte" className={linkClass}>la página de Soporte</Link>
const politica = <Link href="/politica" className={linkClass}>Política de privacidad</Link>
const reglamento = <Link href="/reglamento-puntos" className={linkClass}>Reglamento de puntos</Link>
const copyright = <Link href="/copyright" className={linkClass}>página de Copyright</Link>

// Pedido 2026-11-10: Google (marca verificada del login) y Play Console sugieren una página de condiciones.
// Acompaña a /politica: si cambia una función de la app (puntos, Karai, membresías, publicar), revisar las dos.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Qué es Agroconecta',
    body: 'Agroconecta es una plataforma digital del agro paraguayo: reúne noticias, precios de mercado, eventos, videos, el asistente Karai y los servicios de organizaciones del sector. Estas condiciones se aplican a la app y a la web agroconecta.com.py. Al crear una cuenta o usar la plataforma, aceptás estas condiciones.',
  },
  {
    title: '2. Tu cuenta',
    body: 'Podés entrar con Google, Apple, un código por correo o correo y contraseña. Los datos de tu perfil tienen que ser reales y son tu responsabilidad, igual que lo que pase con tu cuenta. Si notás un acceso que no hiciste vos, avisanos. Podés eliminar tu cuenta cuando quieras desde la app (Perfil → Más → Eliminar cuenta).',
  },
  {
    title: '3. Uso correcto',
    body: 'No está permitido: usar la plataforma para engañar o estafar, publicar contenido falso, ofensivo o ilegal, hacerse pasar por otra persona u organización, copiar en forma masiva el contenido, intentar acceder a datos de otras personas, ni hacer trampa para sumar puntos (cuentas falsas, automatizaciones o lo que prevea el Reglamento de puntos). Si pasa, podemos quitar el contenido, anular puntos o suspender la cuenta.',
  },
  {
    title: '4. La información es de referencia',
    body: 'Los precios, noticias, pronósticos y datos de mercado se publican como referencia y pueden tener demoras o errores. Provienen de fuentes propias y de terceros que citamos en cada caso. No son una recomendación de compra, venta ni inversión: antes de decidir un negocio, confirmá con tu comprador, consignatario, cooperativa o asesor.',
  },
  {
    title: '5. Karai',
    body: 'Karai es un asistente de inteligencia artificial. Sus respuestas pueden tener errores y no reemplazan el consejo de un profesional (ingeniero agrónomo, veterinario, contador o abogado), sobre todo en dosis de productos, sanidad animal o decisiones de dinero. Lo que hagas con una respuesta de Karai es tu decisión. Cómo tratamos tus conversaciones está en la ',
  },
  {
    title: '6. Contenido de organizaciones y aliados',
    body: 'Las organizaciones con plan pueden publicar contenido, que el equipo de Agroconecta revisa antes de mostrarlo. Cada organización es responsable de lo que publica y de tener los derechos sobre textos, fotos y videos. Podemos rechazar o retirar una publicación que no cumpla estas condiciones. Los productos y servicios de terceros que aparecen en la plataforma los ofrece cada empresa, no Agroconecta.',
  },
  {
    title: '7. Noticias de otros medios',
    body: 'Algunas noticias provienen de otros medios del agro. En esos casos mostramos un resumen, citamos la fuente y enlazamos a la nota original. Si sos titular de un contenido y querés que lo quitemos, escribinos.',
  },
  {
    title: '8. Puntos y premios',
    body: 'Los puntos se suman por usar la plataforma y se canjean por premios de aliados. No tienen valor en dinero, no se pueden vender ni transferir y vencen según las reglas del programa. Todo está en el ',
  },
  {
    title: '9. Publicidad',
    body: 'La plataforma muestra anuncios, siempre marcados como "Patrocinado". La relación comercial por un producto anunciado es entre vos y el anunciante.',
  },
  {
    title: '10. Membresías pagas',
    body: 'Algunos servicios, como KARAI Campo, requieren una membresía que se contrata en la web, no dentro de la app. El precio, lo que incluye y su duración se informan antes de pagar. Para consultas sobre una membresía o su cancelación, escribinos.',
  },
  {
    title: '11. Propiedad intelectual',
    body: 'La marca Agroconecta, el diseño de la app y de la web y el contenido propio son de Agroconecta. El contenido de terceros pertenece a sus autores. Para reclamos sobre derechos de autor, mirá la ',
  },
  {
    title: '12. Disponibilidad y responsabilidad',
    body: 'Trabajamos para que la plataforma funcione siempre, pero puede haber cortes, errores o cambios en las funciones. Agroconecta no se hace responsable por daños que surjan de usar la información publicada, de interrupciones del servicio ni de los negocios que hagas con terceros a través de la plataforma, en la medida que lo permita la ley.',
  },
  {
    title: '13. Cambios a estas condiciones',
    body: 'Podemos actualizar estas condiciones cuando la plataforma cambie. Si el cambio es importante, te lo vamos a avisar en la app. Si seguís usándola después del aviso, se entiende que aceptás las condiciones nuevas.',
  },
  {
    title: '14. Ley aplicable',
    body: 'Estas condiciones se rigen por las leyes de la República del Paraguay, incluidas las de defensa del consumidor.',
  },
  {
    title: '15. Contacto',
    body: <>Para cualquier consulta sobre estas condiciones, escribinos desde {soporte}.</>,
  },
]

// Las secciones que terminan en un link se completan acá para no cortar el texto en dos.
const TAIL: Record<string, React.ReactNode> = {
  '5. Karai': <>{politica}.</>,
  '8. Puntos y premios': <>{reglamento}.</>,
  '11. Propiedad intelectual': <>{copyright}.</>,
}

export default function TerminosPage() {
  return (
    <>
      <Header />

      <main className="site-container py-10 md:py-14 max-w-3xl">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">Legal</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight mb-2">Condiciones del servicio</h1>
        <p className="text-muted text-sm mb-8">Última actualización: {UPDATED}</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display font-semibold text-lg text-foreground mb-2">{s.title}</h2>
              <p className="text-muted text-sm leading-relaxed">
                {s.body}
                {TAIL[s.title]}
              </p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
