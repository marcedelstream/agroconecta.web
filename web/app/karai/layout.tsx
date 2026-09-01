import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Karai — Agroconecta',
  description: 'Karai, el asistente de inteligencia artificial de Agroconecta para el productor paraguayo.',
  robots: { index: false, follow: false },
}

export default function KaraiLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg">{children}</div>
}
