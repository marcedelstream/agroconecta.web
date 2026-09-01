import type { Metadata } from 'next'

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
  return <div className="min-h-screen bg-bg">{children}</div>
}
