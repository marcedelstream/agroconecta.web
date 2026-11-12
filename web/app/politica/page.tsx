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

// Si cambia, actualizar también CONSENT_POLICY_VERSION en lib/karai/consents.ts.
const UPDATED = '12 de noviembre de 2026'

const soporte = <Link href="/soporte" className="text-lime hover:underline">la página de Soporte</Link>
const reglamento = <Link href="/reglamento-puntos" className="text-lime hover:underline">Reglamento de puntos</Link>

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
    title: '2. Inicio de sesión con Google o Apple',
    body: 'Si entrás con Google o con Apple, de esa cuenta recibimos solo tu nombre, tu correo y, en el caso de Google, tu foto de perfil. Los usamos únicamente para crear tu cuenta, identificarte cuando volvés a entrar y mostrar tu nombre en tu perfil. No pedimos acceso a tus correos, contactos, calendario ni archivos. No vendemos esos datos, no los usamos para publicidad y no los compartimos con terceros, salvo los proveedores que necesitamos para que el inicio de sesión funcione (Supabase). El uso de la información recibida de las APIs de Google cumple la Política de datos de usuario de los servicios de API de Google, incluidos los requisitos de uso limitado.',
  },
  {
    title: '3. Para qué los usamos',
    body: 'Para ordenar tu feed con lo que más te interesa, recomendarte eventos y contenido cercano, sumar y canjear tus puntos, responderte con Karai, mostrarte publicidad acorde a tu profesión, departamento e intereses, enviarte las notificaciones que activaste y entender, de forma agregada, cómo se usa la app para mejorarla.',
  },
  {
    title: '4. Publicidad',
    body: 'Los anuncios siempre están marcados como "Patrocinado" y podés ver por qué te aparecen. Se eligen con los datos que declaraste en tu perfil; no seguimos lo que hacés en otras apps o sitios. A los anunciantes les mostramos solo resultados agregados (cuántas personas vieron o tocaron su anuncio, por departamento), nunca tus datos personales.',
  },
  {
    title: '5. Karai',
    body: (
      <>
        Tus conversaciones con Karai son privadas: el equipo de Agroconecta no las lee, salvo que sea necesario para
        resolver un problema técnico o investigar un abuso del servicio.
        <br />
        <br />
        <strong>Inteligencia artificial.</strong> Para generar las respuestas, tus mensajes (y, si usás Mi campo, los datos
        de tu establecimiento que sean relevantes para tu consulta) se envían a OpenAI, nuestro proveedor de inteligencia
        artificial, que los procesa en servidores ubicados en Estados Unidos. Configuramos el servicio para que OpenAI no
        guarde las respuestas generadas y, según sus condiciones vigentes, los datos enviados a su API no se usan para
        entrenar sus modelos. Aun así, OpenAI puede conservar registros técnicos de seguridad y control de abusos por un
        plazo de hasta 30 días, según sus propias políticas.
        <br />
        <br />
        <strong>Cuánto tiempo guardamos los chats.</strong> Las conversaciones se guardan para que puedas retomarlas y se
        eliminan automáticamente cuando pasan 365 días sin actividad. También las podés borrar vos en cualquier momento.
        Los datos de tu finca en Mi campo no dependen de las conversaciones: se conservan hasta que los borres.
        <br />
        <br />
        <strong>Oportunidades comerciales.</strong> Si en un mensaje mostrás interés comercial (por ejemplo, que querés
        vender o comprar), o tocás &quot;Avisar a Agroconecta&quot;, guardamos solo ese mensaje puntual para poder contactarte;
        nunca el resto de la conversación. Esos registros se conservan aunque borres la conversación, y se eliminan si
        eliminás tu cuenta o nos lo pedís desde {soporte}.
        <br />
        <br />
        <strong>Mi campo.</strong> Si tenés KARAI Campo, los datos de tu establecimiento que cargás en Mi campo (o que
        mencionás en el chat: hectáreas, animales, cultivos) se usan únicamente para que Karai te responda mejor: no se
        muestran a nadie, no se venden y no se usan para publicidad. Los podés editar o borrar cuando quieras.
        <br />
        <br />
        <strong>Tu consentimiento.</strong> Registramos tu consentimiento para el uso de inteligencia artificial y de Mi
        campo la primera vez que usás cada función, y podés revocarlo cuando quieras desde Mis datos → Privacidad. Si lo
        revocás, Karai deja de usar esa función; lo que ya está guardado se borra con las opciones de esta política.
      </>
    ),
  },
  {
    title: '6. Perfil público',
    body: 'Tu perfil profesional es privado. Solo se puede ver con un link si vos activás "Perfil público" y elegís tu dirección. En ese caso se muestran tu nombre, cargo, formación, experiencia, especialidades y redes; nunca tu correo ni tu teléfono. Lo podés desactivar cuando quieras.',
  },
  {
    title: '7. Puntos y canjes',
    body: (
      <>
        Los puntos que sumás y lo que canjeás quedan registrados en tu cuenta. Cuando canjeás un premio, compartimos con
        el aliado que lo ofrece solo lo necesario para que lo puedas usar (el código de canje). Las reglas del programa
        están en el {reglamento}.
      </>
    ),
  },
  {
    title: '8. Con quién compartimos tus datos',
    body: 'No vendemos tus datos personales. Solo los procesan los proveedores que la app necesita para funcionar: almacenamiento y base de datos (Supabase), alojamiento de la web (Vercel), envío de notificaciones (Expo), inicio de sesión (Google y Apple), envío de correos (Resend) y OpenAI, el proveedor de inteligencia artificial de Karai. Al usar Karai, tus mensajes se envían a los servidores de OpenAI en Estados Unidos, por lo que esa parte del procesamiento ocurre fuera de Paraguay.',
  },
  {
    title: '9. Almacenamiento y seguridad',
    body: 'Tus datos se guardan en Supabase con controles de acceso: cada persona solo puede ver y modificar lo suyo, y lo que tiene valor (puntos, canjes, respuestas del quiz) lo decide el servidor, no la app. Trabajamos para mantener medidas de seguridad razonables.',
  },
  {
    title: '10. Tus derechos',
    body: (
      <>
        Podés ver y corregir tus datos desde tu perfil en la app, y pedirnos una copia o la corrección de cualquier dato
        desde {soporte}.
      </>
    ),
  },
  {
    title: '11. Eliminación de cuenta',
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
    title: '12. Notificaciones',
    body: 'Son opcionales. Te avisamos de noticias importantes, precios o recordatorios de eventos y remates que activaste, solo en las categorías que elegiste. Las podés desactivar desde tu perfil o desde los ajustes de tu teléfono.',
  },
  {
    title: '13. Cambios a esta política',
    body: 'Podemos actualizar esta política cuando la app cambie. Si el cambio es importante, te lo vamos a avisar en la app.',
  },
  {
    title: '14. Contacto',
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
