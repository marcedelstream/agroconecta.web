// Una sola familia (Lexend) para toda la app. Se mantienen las claves poppins*/dmSans*
// para no tener que tocar los ~30 componentes que usan family="poppins"/"dm-sans".
export const Fonts = {
  poppins: 'Lexend-Regular',
  poppinsMedium: 'Lexend-Medium',
  poppinsSemiBold: 'Lexend-SemiBold',
  poppinsBold: 'Lexend-Bold',
  dmSans: 'Lexend-Regular',
  dmSansMedium: 'Lexend-Medium',
  dmSansSemiBold: 'Lexend-SemiBold',
  dmSansBold: 'Lexend-Bold',
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
