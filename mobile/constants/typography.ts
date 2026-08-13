// Una sola familia (Noto Sans, rediseño 2026) para toda la app. Se mantienen las claves
// poppins*/dmSans* para no tener que tocar los ~30 componentes que usan family="poppins"/"dm-sans".
export const Fonts = {
  poppins: 'NotoSans-Regular',
  poppinsMedium: 'NotoSans-Medium',
  poppinsSemiBold: 'NotoSans-SemiBold',
  poppinsBold: 'NotoSans-Bold',
  dmSans: 'NotoSans-Regular',
  dmSansMedium: 'NotoSans-Medium',
  dmSansSemiBold: 'NotoSans-SemiBold',
  dmSansBold: 'NotoSans-Bold',
  notoSans: 'NotoSans-Regular',
  notoSansMedium: 'NotoSans-Medium',
  notoSansSemiBold: 'NotoSans-SemiBold',
  notoSansBold: 'NotoSans-Bold',
  notoSansExtraBold: 'NotoSans-ExtraBold',
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
