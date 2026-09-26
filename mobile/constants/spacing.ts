export const Spacing = {
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
} as const

export const Radius = {
  sm: 8,
  md: 10,
  base: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const

// Medidas fijas del rediseño v2 (docs/design_handoff_v2_feed, README §4).
export const V2Layout = {
  navHeight: 66,
  navRadius: 33,
  navSide: 16,
  navBottom: 22,
  navItemWidth: 60,
  navItemHeight: 56,
  karaiSize: 58,
  karaiLift: 12,
  railButton: 48,
  ctaHeight: 52,
  ctaRadius: 26,
  cardRadius: 20,
  pollRadius: 28,
  minTouch: 44,
  // Variante Android / Material You (prototype/source/Android.dc.html): barra acoplada abajo, no
  // flotante, con indicador en píldora; botón de acción más alto; chips de radio 8.
  android: {
    navHeight: 80,
    indicatorWidth: 64,
    indicatorHeight: 32,
    karaiWidth: 56,
    karaiHeight: 44,
    karaiRadius: 16,
    ctaHeight: 56,
    ctaRadius: 28,
    chipRadius: 8,
    followRadius: 8,
  },
} as const
