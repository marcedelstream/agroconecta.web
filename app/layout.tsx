import type { Metadata } from 'next'
import { DM_Sans, Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SplashScreen } from '@/components/SplashScreen'
import { siteUrl } from '@/lib/seo'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' })

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
    images: [{ url: '/logo-dark.png', width: 1200, height: 630, alt: 'Agroconecta' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agroconecta — Noticias agropecuarias del Paraguay',
    description,
    images: ['/logo-dark.png'],
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
        </ThemeProvider>
      </body>
    </html>
  )
}
