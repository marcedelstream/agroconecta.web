/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/ui/Text.tsx',
    './components/ui/Badge.tsx',
    './components/ui/Button.tsx',
    './components/ui/card.tsx',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#A4D233',
          dark: '#8BB82B',
        },
        agro: {
          bg: '#0A0A13',
          surface: '#12121C',
          secondary: '#1A1A26',
          border: '#2A2A3A',
          muted: '#8B8B9A',
        },
      },
      fontFamily: {
        poppins: ['Poppins-Regular'],
        'poppins-medium': ['Poppins-Medium'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-bold': ['Poppins-Bold'],
        'dm-sans': ['DMSans-Regular'],
        'dm-sans-medium': ['DMSans-Medium'],
        'dm-sans-semibold': ['DMSans-SemiBold'],
        'dm-sans-bold': ['DMSans-Bold'],
      },
    },
  },
  plugins: [],
}
