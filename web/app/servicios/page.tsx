import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ServicesBlock } from '@/components/site/ServicesBlock'

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Consultoría ambiental, comunicación, marketing digital y desarrollo de apps y software para el agro paraguayo.',
  alternates: { canonical: '/servicios' },
}

export default function ServiciosPage() {
  return (
    <>
      <Header />
      <main className="site-container py-10 md:py-16">
        <ServicesBlock />
      </main>
      <Footer />
    </>
  )
}
