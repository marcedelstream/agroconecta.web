import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores temáticos — cambian con data-theme (ver globals.css)
        lime: {
          DEFAULT: 'rgb(var(--clr-lime) / <alpha-value>)',
          dark: 'rgb(var(--clr-lime-dk) / <alpha-value>)',
        },
        bg:         'rgb(var(--clr-bg)        / <alpha-value>)',
        surface:    'rgb(var(--clr-surface)   / <alpha-value>)',
        secondary:  'rgb(var(--clr-secondary) / <alpha-value>)',
        bdr:        'rgb(var(--clr-bdr)       / <alpha-value>)',
        foreground: 'rgb(var(--clr-fg)        / <alpha-value>)',
        muted:      'rgb(var(--clr-muted)     / <alpha-value>)',
        // Colores de sistema — fijos
        success: '#22C55E',
        warning: '#F59E0B',
        info:    '#3B82F6',
        danger:  '#FF4D4D',
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
      keyframes: {
        'load-bar': {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'splash-out': {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0', pointerEvents: 'none' },
        },
      },
      animation: {
        'load-bar':   'load-bar 1.6s ease-in-out forwards',
        'fade-up':    'fade-up 0.5s ease-out forwards',
        'splash-out': 'splash-out 0.5s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
