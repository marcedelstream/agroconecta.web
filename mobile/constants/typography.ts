// Una sola familia (Figtree, rediseño v2 2026-09) para toda la app. Se mantienen las claves
// poppins*/dmSans*/notoSans* — mismo truco que con Lexend y Noto Sans — para no tener que tocar los
// componentes que usan family="poppins"/"dm-sans"/"noto-sans".
export const Fonts = {
  poppins: 'Figtree-Regular',
  poppinsMedium: 'Figtree-Medium',
  poppinsSemiBold: 'Figtree-SemiBold',
  poppinsBold: 'Figtree-Bold',
  dmSans: 'Figtree-Regular',
  dmSansMedium: 'Figtree-Medium',
  dmSansSemiBold: 'Figtree-SemiBold',
  dmSansBold: 'Figtree-Bold',
  notoSans: 'Figtree-Regular',
  notoSansMedium: 'Figtree-Medium',
  notoSansSemiBold: 'Figtree-SemiBold',
  notoSansBold: 'Figtree-Bold',
  notoSansExtraBold: 'Figtree-ExtraBold',
} as const
export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const

export const LineHeights = {
  xs: 16,
  sm: 18,
  base: 22,
  md: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
} as const
