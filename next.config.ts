import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const root = dirname(fileURLToPath(import.meta.url))

const config: NextConfig = {
  output: 'standalone',
  turbopack: {
    root,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
}

export default config
