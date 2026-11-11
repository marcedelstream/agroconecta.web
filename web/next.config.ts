import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const root = dirname(fileURLToPath(import.meta.url))

const config: NextConfig = {
  turbopack: {
    root,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Direcciones que se suelen escribir de memoria (Google tenía cargada /privacidad en la pantalla del login).
  async redirects() {
    return [
      { source: '/privacidad', destination: '/politica', permanent: true },
      { source: '/privacy', destination: '/politica', permanent: true },
      { source: '/terms', destination: '/terminos', permanent: true },
      { source: '/condiciones', destination: '/terminos', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
}

export default config
