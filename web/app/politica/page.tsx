import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad de Agroconecta — qué datos recolectamos, para qué los usamos y cómo eliminar tu cuenta.',
  alternates: {
    canonical: '/politica',
  },
}

const UPDATED = '26 de septiembre de 2026'

const soporte = <Link href="/soporte" className="text-lime hover:underline">la página de Soporte</Link>

// Refleja lo que hace la app v2 (feed personalizado, puntos, Karai, publicidad segmentada, perfil
// público). Si se agrega una función que use datos nuevos, actualizar acá antes de publicarla.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Qué datos recolectamos',
    body: (
      <>
        <strong>Los que nos das:</strong> nombre, correo electrónico, teléfono (opcional), profesión y departamento; tus
        rubros, lo que producís, para qué usás la app y tu escala; las organizaciones que seguís; y, si lo completás, tu
        perfil profesional (cargo, formación, experiencia, especialidades y redes sociales). El departamento lo elegís
        vos: no usamos la ubicación GPS de tu teléfono.
        <br />
        <br />
        <strong>Lo que hacés en la app:</strong> qué contenido ves y por cuánto tiempo, tus me gusta, guardados,
        recordatorios, respuestas a encuestas y quiz, tus puntos y canjes, las publicidades que ves o tocás, y tus
        mensajes con Karai. También guardamos el identificador de notificaciones de tu teléfono si las activás. La foto
        de perfil queda solo en tu teléfono.
      </>
    ),
  },
  {
    title: '2. Para qué los usamos',
    body: 'Para ordenar tu feed con lo que más te interesa, recomendarte eventos y contenido cercano, sumar y canjear tus puntos, responderte con Karai, mostrarte publicidad acorde a tu profesión, departamento e intereses, enviarte las notificaciones que activaste y entender, de forma agregada, cómo se usa la app para mejorarla.',
  },
  {
    title: '3. Publicidad',
    body: 'Los anuncios siempre están marcados como "Patrocinado" y podés ver por qué te aparecen. Se eligen con los datos que declaraste en tu perfil; no seguimos lo que hacés en otras apps o sitios. A los anunciantes les mostramos solo resultados agregados (cuántas personas vieron o tocaron su anuncio, por departamento), nunca tus datos personales.',
  },
  {
    title: '4. Karai',
    body: 'Tus conversaciones con Karai son privadas: el equipo de Agroconecta no las lee. Para generar las respuestas, tus mensajes se procesan con un proveedor de inteligencia artificial. Si en un mensaje mostrás interés comercial (por ejemplo, que querés vender o comprar), guardamos solo ese mensaje puntual para poder contactarte; nunca el resto de la conversación.',
  },
  {
    title: '5. Perfil público',
    body: 'Tu perfil profesional es privado. Solo se puede ver con un link si vos activás "Perfil público" y elegís tu dirección. En ese caso se muestran tu nombre, cargo, formación, experiencia, especialidades y redes; nunca tu correo ni tu teléfono. Lo podés desactivar cuando quieras.',
  },
  {
    title: '6. Puntos y canjes',
    body: (
      <>
        Los puntos que sumás y lo que canjeás quedan registrados en tu cuenta. Cuando canjeás un premio, compartimos con
        el aliado que lo ofrece solo lo necesario para que lo puedas usar (el código de canje). Las reglas del programa
        se publican en el Reglamento de puntos.
      </>
    ),
  },
  {
    title: '7. Con quién compartimos tus datos',
    body: 'No vendemos tus datos personales. Solo los procesan los proveedores que la app necesita para funcionar: almacenamiento y base de datos (Supabase), alojamiento de la web (Vercel), envío de notificaciones (Expo), inicio de sesión (Google y Apple), envío de correos (Resend) y el proveedor de inteligencia artificial de Karai.',
  },
  {
    title: '8. Almacenamiento y seguridad',
    body: 'Tus datos se guardan en Supabase con controles de acceso: cada persona solo puede ver y modificar lo suyo, y lo que tiene valor (puntos, canjes, respuestas del quiz) lo decide el servidor, no la app. Trabajamos para mantener medidas de seguridad razonables.',
  },
  {
    title: '9. Tus derechos',
    body: (
      <>
        Podés ver y corregir tus datos desde tu perfil en la app, y pedirnos una copia o la corrección de cualquier dato
        desde {soporte}.
      </>
    ),
  },
  {
    title: '10. Eliminación de cuenta',
    body: (
      <>
        Podés eliminar tu cuenta en cualquier momento desde la app: Perfil → Más → Eliminar cuenta. Se borran tu perfil,
        intereses, organizaciones seguidas, guardados, recordatorios, actividad, puntos, canjes y conversaciones con
        Karai, y no se puede deshacer. Los registros de publicidad quedan solo como números anónimos. Si ya no tenés la
        app, escribinos desde {soporte} y la eliminamos nosotros.
      </>
    ),
  },
  {
    title: '11. Notificaciones',
    body: 'Son opcionales. Te avisamos de noticias importantes, precios o recordatorios de eventos y remates que activaste, solo en las categorías que elegiste. Las podés desactivar desde tu perfil o desde los ajustes de tu teléfono.',
  },
  {
    title: '12. Cambios a esta política',
    body: 'Podemos actualizar esta política cuando la app cambie. Si el cambio es importante, te lo vamos a avisar en la app.',
  },
  {
    title: '13. Contacto',
    body: <>Si tenés preguntas sobre tus datos personales, escribinos desde {soporte}.</>,
  },
]

export default function PoliticaPage() {
  return (
    <>
      <Header />

      <main className="site-container py-10 md:py-14 max-w-3xl">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">Legal</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight mb-2">Política de privacidad</h1>
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
