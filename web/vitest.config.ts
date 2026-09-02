import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Solo necesitamos que resuelva el alias "@/*" de tsconfig.json — los tests de Karai son módulos
// puros de lib/, sin JSX ni nada que dependa del runtime de Next.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
