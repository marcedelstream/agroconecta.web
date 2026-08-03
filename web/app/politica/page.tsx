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

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Qué datos recolectamos',
    body: 'Recolectamos los datos que nos proporcionás al registrarte: nombre, correo electrónico, teléfono, profesión y departamento. También guardamos tus preferencias de contenido y las organizaciones que decidís seguir.',
  },
  {
    title: '2. Para qué usamos tus datos',
    body: 'Usamos tu información para personalizar el feed de noticias y precios que ves, enviarte notificaciones relevantes (si las activaste) y mejorar la experiencia general de la app.',
  },
  {
    title: '3. Con quién compartimos tus datos',
    body: 'No vendemos tus datos personales a terceros. Solo se comparten con proveedores de servicios necesarios para el funcionamiento de la app (por ejemplo, el envío de notificaciones push o el procesamiento de formularios de contacto).',
  },
  {
    title: '4. Almacenamiento y seguridad',
    body: 'Tus datos se almacenan en infraestructura de Supabase con controles de acceso basados en tu identidad de usuario. Trabajamos para mantener medidas de seguridad razonables acordes al tamaño del proyecto.',
  },
  {
    title: '5. Tus derechos',
    body: 'Podés acceder, corregir o eliminar tus datos personales en cualquier momento.',
  },
  {
    title: '6. Eliminación de cuenta',
    body: 'Podés eliminar tu cuenta y todos tus datos personales en cualquier momento desde la app: Perfil → Eliminar cuenta. Esta acción borra tu perfil, preferencias, suscripciones y no se puede deshacer. Si preferís hacerlo sin usar la app, o si ya la desinstalaste, escribinos desde la página de Soporte y procesamos la eliminación desde nuestro lado.',
  },
  {
    title: '7. Notificaciones',
    body: 'Las notificaciones push son opcionales. Podés activarlas o desactivarlas en cualquier momento desde los ajustes de tu dispositivo o desde tu perfil dentro de la app.',
  },
  {
    title: '8. Cambios a esta política',
    body: 'Esta Política de Privacidad puede actualizarse para reflejar cambios en la app o en la normativa aplicable. Te recomendamos revisarla periódicamente.',
  },
  {
    title: '9. Contacto',
    body: 'Si tenés preguntas sobre el tratamiento de tus datos personales, escribinos a través de la página de Soporte.',
  },
]

export default function PoliticaPage() {
  return (
    <>
      <Header />

      <main className="site-container py-10 md:py-14 max-w-3xl">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          Legal
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight mb-8">
          Política de privacidad
        </h1>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display font-semibold text-lg text-foreground mb-2">{s.title}</h2>
              <p className="text-muted text-sm leading-relaxed">
                {s.title === '6. Eliminación de cuenta' ? (
                  <>
                    Podés eliminar tu cuenta y todos tus datos personales en cualquier momento desde la app:
                    Perfil → Eliminar cuenta. Esta acción borra tu perfil, preferencias, suscripciones y no
                    se puede deshacer. Si preferís hacerlo sin usar la app, o si ya la desinstalaste,{' '}
                    <Link href="/soporte" className="text-lime hover:underline">escribinos desde Soporte</Link>{' '}
                    y procesamos la eliminación desde nuestro lado.
                  </>
                ) : s.title === '9. Contacto' ? (
                  <>
                    Si tenés preguntas sobre el tratamiento de tus datos personales, escribinos a través de{' '}
                    <Link href="/soporte" className="text-lime hover:underline">la página de Soporte</Link>.
                  </>
                ) : (
                  s.body
                )}
              </p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
