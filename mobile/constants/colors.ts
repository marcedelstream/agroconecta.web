export const Colors = {
  lime: '#A4D233',
  limeDark: '#8BB82B',

  background: '#0A0A13',
  surface: '#12121C',
  secondary: '#1A1A26',

  foreground: '#FFFFFF',
  muted: '#8B8B9A',
  border: '#2A2A3A',
  destructive: '#FF4D4D',

  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',

  overlay: 'rgba(0, 0, 0, 0.6)',

  // Light theme
  light: {
    lime: '#7AB800',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    secondary: '#F0F0F0',
    foreground: '#0A0A13',
    muted: '#6B7280',
    border: '#E5E5E5',
  },

  // Categorías noticias
  category: {
    ganaderia: '#A4D233',
    agricultura: '#22C55E',
    clima: '#3B82F6',
    mercados: '#F59E0B',
    tecnologia: '#8B5CF6',
    institucional: '#6B7280',
  },

  // Categorías ecosistema
  ecosystem: {
    eventos: '#3B82F6',
    juegos: '#8B5CF6',
    institucional: '#A4D233',
    streaming: '#EF4444',
  },

  // Rediseño 2026 (handoff design_handoff_home_redesign) — tema claro fijo, no depende del toggle de tema.
  // Se usa hoy en Home (boceto 3a); las pantallas internas (4a-4f) reusan los mismos tokens cuando se aborden.
  redesign: {
    background: '#F1F1EC',
    surface: '#FFFFFF',
    secondary: '#F5F5F0',
    foreground: '#101014',
    mutedForeground: '#7A7A85',
    mutedForeground2: '#9A9AA3',
    divider: '#F2F2ED',
    border: '#E2E2DB',
    limeSoftBg: '#EAF4D2',
    limeSoftText: '#4E7014',
    alert: '#D33A3A',
    alertBg: '#FDE7E7',
    positive: '#22C55E',
    negative: '#FF4D4D',
    header: {
      bg: '#0A1720',
      chip: '#1C1C24',
      chipBorder: '#2E2E38',
      mutedText: '#8C8C99',
      placeholder: '#7C7C89',
    },
    // Ficha única de Ecosistema (boceto 4f) — empleo/clasificado/curso
    listingKind: {
      empleo: { bg: '#E3EBFD', text: '#1D4ED8', label: 'EMPLEO' },
      clasificado: { bg: '#FDF0D8', text: '#9A6200', label: 'CLASIFICADO' },
      curso: { bg: '#EDE6FD', text: '#6D28D9', label: 'CURSO' },
    },
  },

  // Rediseño v2 — feed vertical (docs/design_handoff_v2_feed, README §4). Paleta fija, no depende del
  // toggle de tema. `lime` nunca va como texto sobre blanco: para eso está `limeText` (contraste AA).
  v2: {
    lime: '#A4D233',
    limeText: '#4E6B12',
    limeTint: '#EEF4DC',
    limeTintText: '#3F5A0C',
    navy: '#0B1620',
    ground: '#F4F5F0',
    surface: '#FFFFFF',
    muted: '#5A5F55',
    live: '#E5484D',
    sponsor: '#E0A100',
    white: '#FFFFFF',
    glass: {
      bg: 'rgba(255,255,255,0.16)',
      border: 'rgba(255,255,255,0.24)',
    },
    nav: {
      darkBg: 'rgba(14,20,16,0.34)',
      darkBorder: 'rgba(255,255,255,0.18)',
      darkActive: '#FFFFFF',
      darkIdle: 'rgba(255,255,255,0.7)',
      lightBg: 'rgba(255,255,255,0.74)',
      lightBorder: 'rgba(11,22,32,0.08)',
      lightActive: '#0B1620',
      lightIdle: '#6B7066',
      // Android: sin blur real (caro y dispar entre versiones) → fondo translúcido más opaco.
      darkBgAndroid: 'rgba(14,20,16,0.82)',
      lightBgAndroid: 'rgba(255,255,255,0.96)',
      shadow: '#000000',
    },
    feed: {
      // Degradado .shade del prototipo: arriba suave para el logo, abajo casi negro para el texto.
      shade: ['rgba(4,9,6,0.42)', 'rgba(4,9,6,0)', 'rgba(4,9,6,0)', 'rgba(4,9,6,0.5)', 'rgba(4,9,6,0.9)'],
      shadeStops: [0, 0.16, 0.44, 0.64, 1],
      // Sin foto: fondo de marca en vez de un gris vacío.
      fallback: ['#1D3324', '#0B1620'],
      glassAndroid: 'rgba(20,28,22,0.55)',
      heart: '#FF5A5F',
      tag: '#D4ED8E',
      textSoft: 'rgba(255,255,255,0.84)',
      textOrg: 'rgba(255,255,255,0.9)',
      textShadow: 'rgba(0,0,0,0.6)',
      avatarBg: '#0B1620',
      progressTrack: 'rgba(255,255,255,0.25)',
      // Tarjeta "Tu mercado hoy" sobre fondo oscuro.
      priceUp: '#A4D233',
      priceDown: '#FF6B6B',
      textMuted: 'rgba(255,255,255,0.6)',
      divider: 'rgba(255,255,255,0.12)',
    },
    // Ficha "Ver …" (hoja inferior clara sobre el feed).
    sheet: {
      backdrop: 'rgba(4,9,6,0.5)',
      border: 'rgba(11,22,32,0.14)',
      borderSoft: 'rgba(11,22,32,0.06)',
      activeBg: '#E6E8E0',
      closeBg: 'rgba(11,22,32,0.35)',
      body: '#3E433B',
      handle: 'rgba(255,255,255,0.7)',
    },
    toastBg: 'rgba(11,22,32,0.86)',
    sponsorChipBg: 'rgba(255,255,255,0.92)',
    liveCard: 'rgba(12,16,14,0.62)',
    liveCardAndroid: 'rgba(12,16,14,0.9)',
    liveCardBorder: 'rgba(255,255,255,0.18)',
    // Encuesta y quiz (tarjeta blanca centrada del feed).
    interactive: {
      optionBg: '#F2F4EC',
      optionBorder: 'rgba(11,22,32,0.08)',
      bar: 'rgba(164,210,51,0.5)',
      okBg: '#EEF6D6',
      okBorder: '#6E9A1E',
      badBg: '#FDECEA',
      badBorder: '#C2410C',
      badText: '#B42318',
      cardShadow: '#000000',
    },
    // Pantallas claras v2 (Precios, Explorar, Guardados…).
    light: {
      segTrack: '#E6E8E0',
      inputBorder: 'rgba(11,22,32,0.1)',
      clearBg: '#EEF0EA',
      cardBorder: 'rgba(11,22,32,0.06)',
      shadow: '#0B1620',
      placeholder: '#8A9083',
      // Variación de precios sobre blanco (contraste AA; el lima no va como texto sobre blanco).
      upText: '#3F6B12',
      upBg: '#EEF4DC',
      downText: '#B42318',
      downBg: '#FDE7E7',
    },
  },
} as const
