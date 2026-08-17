import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SplashScreen } from '@/components/SplashScreen'
import { AppDownloadTab } from '@/components/AppDownloadTab'
import { siteUrl } from '@/lib/seo'
import './globals.css'

// Una sola familia (Lexend) para toda la web. Se mantienen las dos variables CSS
// (--font-dm-sans / --font-poppins) para no tener que tocar tailwind.config ni las
// clases font-sans/font-display usadas en todo components/.
const dmSans = Lexend({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans', display: 'swap' })
const poppins = Lexend({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' })

const description = 'Noticias agropecuarias publicadas por Agroconecta y organizaciones verificadas del sector paraguayo.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Agroconecta — Noticias agropecuarias del Paraguay',
    template: '%s | Agroconecta',
  },
  description,
  openGraph: {
    siteName: 'Agroconecta',
    locale: 'es_PY',
    type: 'website',
    title: 'Agroconecta — Noticias agropecuarias del Paraguay',
    description,
    url: '/',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Agroconecta — Una nueva forma de vivir el agro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agroconecta — Noticias agropecuarias del Paraguay',
    description,
    images: ['/og-default.png'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-foreground font-sans antialiased">
        <ThemeProvider>
          <SplashScreen />
          {children}
          <AppDownloadTab />
        </ThemeProvider>
      </body>
    </html>
  )
}
