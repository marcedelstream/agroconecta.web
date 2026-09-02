import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-karai-sans',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-karai-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Karai — Agroconecta',
  description: 'Karai, el asistente de inteligencia artificial de Agroconecta para el productor paraguayo.',
  robots: { index: false, follow: false },
  // La convención de archivo (icon.png en esta carpeta) no pisa el `icons` explícito que ya
  // declara el layout raíz (favicon.png) — hay que sobreescribirlo acá a mano para que el
  // subdominio de Karai tenga su propio ícono en la pestaña.
  icons: { icon: '/karai/icon.png', apple: '/karai/icon.png' },
}

export default function KaraiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`karai-root ${plusJakarta.variable} ${jetBrainsMono.variable} min-h-screen bg-[var(--k-bg)] font-[family-name:var(--font-karai-sans)]`}>
      {children}
    </div>
  )
}
