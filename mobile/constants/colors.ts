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
      bg: '#101014',
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
} as const
