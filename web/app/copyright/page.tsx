import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Copyright',
  description: 'Derechos de autor de Agroconecta — propiedad del contenido, uso permitido y cómo reportar una infracción.',
  alternates: {
    canonical: '/copyright',
  },
}

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Titularidad',
    body: 'El diseño, la marca, el logo, el código y los textos propios de Agroconecta son propiedad de Agroconecta. Su reproducción, distribución o uso comercial sin autorización previa está prohibida.',
  },
  {
    title: '2. Contenido de organizaciones y medios verificados',
    body: 'Las noticias, imágenes y videos publicados por organizaciones, medios y aliados verificados en la plataforma son propiedad de sus respectivos autores. Agroconecta los aloja y distribuye con su autorización, pero no reclama titularidad sobre ese contenido.',
  },
  {
    title: '3. Uso permitido',
    body: 'Podés compartir enlaces a nuestras notas y contenidos libremente. La reproducción total o parcial de artículos, imágenes o videos en otro sitio o publicación sin permiso expreso del autor u organización correspondiente no está permitida.',
  },
  {
    title: '4. Marca',
    body: '"Agroconecta", su isologo y su identidad visual son marcas de Agroconecta. No pueden usarse para identificar otros productos, servicios o proyectos sin autorización.',
  },
  {
    title: '5. Reportar una infracción',
    body: (
      <>
        Si creés que tu contenido fue publicado en Agroconecta sin autorización, o que alguien está usando
        nuestra marca o contenido de forma indebida, escribinos desde{' '}
        <Link href="/soporte" className="text-lime hover:underline">la página de Soporte</Link> con el
        detalle y lo revisamos.
      </>
    ),
  },
]

export default function CopyrightPage() {
  const year = new Date().getFullYear()

  return (
    <>
      <Header />

      <main className="site-container py-10 md:py-14 max-w-3xl">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          Legal
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight mb-3">
          Copyright
        </h1>
        <p className="text-muted text-sm mb-8">© {year} Agroconecta. Todos los derechos reservados.</p>

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
