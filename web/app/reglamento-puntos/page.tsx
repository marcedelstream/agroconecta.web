import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Reglamento de puntos',
  description: 'Cómo se suman, canjean y vencen los puntos de Agroconecta.',
  alternates: {
    canonical: '/reglamento-puntos',
  },
}

const UPDATED = '28 de septiembre de 2026'

// Datos del organizador del programa. Mientras estén vacíos, el encabezado muestra solo "Agroconecta".
const ORGANIZER = { legalName: '', ruc: '' }

// Los valores deben coincidir con points_config (supabase/fix-v2-points.sql y fix-v2-points-rules.sql).
// Si se cambia un valor en la base, actualizarlo acá y avisar con 30 días (punto 11).
const RULES = {
  welcome: 50,
  pollVote: 10,
  quizCorrect: 10,
  profileComplete: 30,
  expiryMonths: 12,
  redemptionDays: 60,
  noticeDays: 30,
}

const soporte = <Link href="/soporte" className="text-lime hover:underline">la página de Soporte</Link>
const privacidad = <Link href="/politica" className="text-lime hover:underline">Política de privacidad</Link>

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Qué es el programa',
    body: 'El programa de puntos de Agroconecta premia tu participación en la app. Sumás puntos con ciertas acciones y los podés canjear por premios que ofrecen nuestros aliados, como cursos, entradas a eventos o charlas. Participar es gratis y voluntario.',
  },
  {
    title: '2. Quién puede participar',
    body: 'Personas mayores de 18 años, residentes en Paraguay, con una cuenta de Agroconecta y su correo electrónico verificado, que hayan aceptado participar del programa. Cada persona puede tener una sola cuenta.',
  },
  {
    title: '3. Cómo se suman puntos',
    body: (
      <>
        Hoy se suman así:
        <br />• Bienvenida, al terminar el registro: {RULES.welcome} puntos, una sola vez.
        <br />• Completar tu perfil profesional (cargo, lugar de trabajo, formación y al menos una especialidad):{' '}
        {RULES.profileComplete} puntos, una sola vez.
        <br />• Responder una encuesta: {RULES.pollVote} puntos por encuesta.
        <br />• Acertar una pregunta de un quiz: {RULES.quizCorrect} puntos por respuesta correcta. Cada pregunta se
        responde una sola vez.
        <br />
        <br />
        No hay un tope diario. Los puntos los calcula y registra nuestro servidor; el saldo y el historial que ves en la
        app son los que valen.
      </>
    ),
  },
  {
    title: '4. Valor de los puntos',
    body: 'Los puntos no tienen valor en dinero: no se pueden cambiar por efectivo, vender ni transferir a otra persona o cuenta. Solo se usan para canjear los premios del catálogo de la app.',
  },
  {
    title: '5. Vencimiento',
    body: `Si pasan ${RULES.expiryMonths} meses sin que sumes ni canjees puntos, tu saldo vence y vuelve a cero. Cada vez que sumás o canjeás, el plazo empieza de nuevo. También perdés tus puntos si eliminás tu cuenta.`,
  },
  {
    title: '6. Cómo se canjean',
    body: 'En la app, entrá a Canjes, elegí un premio y confirmá. Si te alcanzan los puntos y quedan cupos, se descuentan de tu saldo y recibís un código AGRO-XXXX. Los premios, sus cupos y su costo en puntos pueden cambiar según lo que ofrezcan los aliados.',
  },
  {
    title: '7. Código de canje',
    body: `El código vale ${RULES.redemptionDays} días desde que canjeás. Pasado ese plazo queda vencido y no se puede usar. Una vez hecho, el canje no se puede cancelar y los puntos no se devuelven, tampoco si el código vence sin usarse.`,
  },
  {
    title: '8. Entrega de los premios',
    body: 'Cada premio lo entrega el aliado que lo ofrece, que es responsable de cumplirlo en las condiciones publicadas. Al canjear, aceptás esas condiciones (fechas, lugar, cupos y requisitos del aliado). Agroconecta intermedia: si el aliado no puede entregar el premio, escribinos y te ayudamos a resolverlo; si el premio no se entrega por causas del aliado, Agroconecta puede devolverte los puntos.',
  },
  {
    title: '9. Uso indebido',
    body: 'No está permitido sumar puntos con trampas: varias cuentas de una misma persona, cuentas falsas, automatizaciones o aprovechar errores de la app. Si detectamos un uso indebido, anulamos los puntos de las cuentas involucradas y los canjes pendientes.',
  },
  {
    title: '10. Datos personales',
    body: <>Tus puntos y canjes se tratan según nuestra {privacidad}. Al aliado solo le llega lo necesario para entregar el premio (el código de canje).</>,
  },
  {
    title: '11. Cambios y fin del programa',
    body: `Podemos cambiar este reglamento, los valores de puntos o el catálogo de premios, o terminar el programa. Te avisaremos en la app con al menos ${RULES.noticeDays} días de anticipación. Si el programa termina, vas a tener ese plazo para canjear tus puntos.`,
  },
  {
    title: '12. Aceptación',
    body: 'Al activar tu participación en el programa aceptás este reglamento, junto con los Términos de uso y la Política de privacidad de Agroconecta.',
  },
  {
    title: '13. Contacto',
    body: <>Si tenés dudas sobre tus puntos o un canje, escribinos desde {soporte}.</>,
  },
]

export default function ReglamentoPuntosPage() {
  const organizer = [ORGANIZER.legalName || 'Agroconecta', ORGANIZER.ruc && `RUC ${ORGANIZER.ruc}`].filter(Boolean).join(' · ')
  return (
    <>
      <Header />

      <main className="site-container py-10 md:py-14 max-w-3xl">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">Legal</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight mb-2">Reglamento de puntos</h1>
        <p className="text-muted text-sm">Organiza: {organizer}</p>
        <p className="text-muted text-sm mb-8">Última actualización: {UPDATED}</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display font-semibold text-lg text-foreground mb-2">{s.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
