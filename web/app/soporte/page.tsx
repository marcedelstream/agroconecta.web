import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WHATSAPP_NUMBER, WHATSAPP_URL } from '@/lib/social-links'
import { SoporteForm } from './SoporteForm'

export const metadata: Metadata = {
  title: 'Soporte',
  description: 'Contacto y soporte de Agroconecta — consultas sobre la app y solicitudes de eliminación de cuenta.',
  alternates: {
    canonical: '/soporte',
  },
}

export default function SoportePage() {
  return (
    <>
      <Header />

      <main className="site-container py-10 md:py-14 max-w-2xl">
        <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          Soporte
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight mb-4">
          ¿Necesitás ayuda?
        </h1>
        <p className="text-muted text-base mb-8 leading-relaxed">
          Escribinos por WhatsApp o dejanos tu consulta acá abajo — sirve tanto para soporte técnico de la
          app como para pedir la eliminación de tu cuenta y tus datos si no podés hacerlo desde el perfil.
        </p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-bdr bg-surface px-4 py-3 text-sm font-medium text-foreground hover:border-lime/50 transition-colors mb-10"
        >
          WhatsApp · {WHATSAPP_NUMBER}
        </a>

        <div className="rounded-xl border border-bdr bg-surface p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Enviar consulta</h2>
          <SoporteForm />
        </div>
      </main>

      <Footer />
    </>
  )
}
