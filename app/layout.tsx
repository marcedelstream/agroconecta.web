import type { Metadata } from 'next'
import { DM_Sans, Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SplashScreen } from '@/components/SplashScreen'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Agroconecta — Noticias agropecuarias del Paraguay',
    template: '%s | Agroconecta',
  },
  description: 'Noticias agropecuarias publicadas por Agroconecta y organizaciones verificadas del sector paraguayo.',
  openGraph: { siteName: 'Agroconecta', locale: 'es_PY', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-foreground font-sans antialiased">
        <ThemeProvider>
          <SplashScreen />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
