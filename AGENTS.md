# AGROCONECTA — Codex Session Guide

## Qué es este proyecto

**Agroconecta** es un ecosistema digital agropecuario para Paraguay. Es una app mobile (React Native + Expo) que centraliza noticias, precios de mercado y productos del ecosistema para productores, veterinarios, agrónomos y demás profesionales del agro paraguayo.

## Stack tecnológico (target)

| Capa | Tecnología |
|---|---|
| Framework | **React Native + Expo SDK 52+** |
| Router | **Expo Router v4** (file-based, similar a Next.js) |
| Styling | **NativeWind v4** (Tailwind para RN) |
| UI Components | Componentes propios basados en el design system |
| State | **React Context API** (sin Redux/Zustand por ahora) |
| Navegación | **React Navigation v7** (via Expo Router) |
| Tipos | **TypeScript** estricto |
| Íconos | **@expo/vector-icons** (Ionicons) |
| Fuentes | **Expo Google Fonts** (Poppins + DM Sans) |
| Validación | **Zod + React Hook Form** |
| Charts | **Victory Native XL** o **react-native-gifted-charts** |

## Origen: web (Next.js → React Native)

El proyecto original era Next.js 16 + shadcn/ui + Tailwind. Fue completamente refactorizado a React Native. Los archivos web originales pueden existir aún como referencia pero **NO se usan**.

## Design System

### Paleta de colores

```typescript
// Siempre usar estas constantes, nunca valores hardcodeados
const colors = {
  // Primario
  lime: '#A4D233',          // verde lima — color principal de marca
  limeDark: '#8BB82B',       // variante oscura del lima

  // Fondos (dark theme — default)
  background: '#0A0A13',     // fondo principal
  surface: '#12121C',        // tarjetas / elevated
  secondary: '#1A1A26',      // superficies secundarias

  // Texto
  foreground: '#FFFFFF',
  mutedForeground: '#8B8B9A',

  // Sistema
  border: '#2A2A3A',
  destructive: '#FF4D4D',

  // Light theme
  lightBackground: '#FAFAFA',
  lightSurface: '#FFFFFF',
  lightSecondary: '#F0F0F0',
  lightForeground: '#0A0A13',
  lightBorder: '#E5E5E5',
  lightLime: '#7AB800',
}
```

### Tipografía

- **Display / Títulos:** Poppins (300, 400, 500, 600, 700)
- **Body / UI:** DM Sans (400, 500, 600, 700)

### Border radius

- `sm`: 8px
- `md`: 10px  
- `base`: 12px
- `lg`: 12px
- `xl`: 16px

### Spacing base

Usar múltiplos de 4. Base unit = 4px.

---

## Estructura de carpetas (React Native / Expo Router)

```
AGROCONECTA APP/
├── app/                          # Expo Router — rutas file-based
│   ├── _layout.tsx               # Root layout (fonts, providers)
│   ├── index.tsx                 # Entry → redirige a splash
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   └── index.tsx             # Flujo onboarding 4 pasos
│   └── (main)/
│       ├── _layout.tsx           # Bottom tabs layout
│       ├── home.tsx              # Feed de noticias
│       ├── prices.tsx            # Precios ganaderos
│       ├── ecosystem.tsx         # Ecosistema digital
│       └── profile.tsx           # Perfil de usuario
├── components/
│   ├── ui/                       # Componentes base del design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Text.tsx              # Tipografía con variantes
│   │   └── ...
│   ├── screens/                  # Componentes de pantalla complejos
│   └── navigation/               # Headers, tabs, etc.
├── constants/
│   ├── colors.ts                 # Tokens de color
│   ├── typography.ts             # Fuentes y tamaños
│   └── spacing.ts                # Espaciado
├── lib/
│   ├── types.ts                  # Interfaces TypeScript
│   ├── mock-data.ts              # Datos de prueba
│   └── app-context.tsx           # Estado global (Context API)
├── hooks/                        # Custom hooks
├── assets/
│   ├── fonts/                    # Poppins + DM Sans
│   └── images/                  # Logo, íconos
├── app.json                      # Config Expo
├── babel.config.js
├── tailwind.config.js            # NativeWind config
└── tsconfig.json
```

---

## Pantallas y flujo de la app

### 1. Splash Screen
- Logo centrado + animación de carga
- Auto-navega a onboarding (primera vez) o main (ya configurado)
- Duración: ~2.5 segundos

### 2. Onboarding (4 pasos)
- **Paso 0:** Nombre del usuario (mín 2 chars)
- **Paso 1:** Profesión (8 opciones: productor, comunicador, veterinario, agrónomo, comerciante, transportista, estudiante, otro)
- **Paso 2:** Departamento de Paraguay (18 opciones)
- **Paso 3:** Preferencias de noticias (6 categorías: Ganadería, Agricultura, Clima, Mercados, Tecnología Agro, Institucional)
- Barra de progreso visual, animaciones de slide entre pasos

### 3. Main App — Bottom Tabs (4 tabs)

| Tab | Ícono | Descripción |
|---|---|---|
| Inicio | Home | Feed de noticias con filtros y búsqueda |
| Precios | TrendingUp | Precios ganaderos + commodities internacionales |
| Ecosistema | Globe | Productos del ecosistema (Eventosagropy, Agrojuego, etc.) |
| Perfil | User | Datos del usuario, configuraciones |

---

## Tipos de datos clave

```typescript
type Profession = 'productor' | 'comunicador' | 'veterinario' | 'agronomo' | 'comerciante' | 'transportista' | 'estudiante' | 'otro'

type Department = 'Asunción' | 'Central' | 'Alto Paraná' | 'Itapuá' | 'Caaguazú' | 'San Pedro' | 'Canindeyu' | 'Paraguarí' | 'Cordillera' | 'Guairá' | 'Caazapá' | 'Misiones' | 'Ñeembucú' | 'Amambay' | 'Concepción' | 'Presidente Hayes' | 'Boqueron' | 'Alto Paraguay'

type NewsCategory = 'ganaderia' | 'agricultura' | 'clima' | 'mercados' | 'tecnologia' | 'institucional'

type EcosystemCategory = 'eventos' | 'juegos' | 'institucional' | 'streaming'

interface UserProfile {
  id: string
  name: string
  profession: Profession
  department: Department
  preferences: NewsCategory[]
  createdAt: Date
}

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  category: NewsCategory
  imageUrl: string
  source: string
  publishedAt: Date
  readTime: number
  isHighlighted?: boolean
}

interface CattlePrice {
  category: string
  pricePerKg: number   // en PYG
  change: number
  changePercent: number
  updatedAt: Date
}

interface InternationalPrice {
  commodity: string
  price: number        // en USD
  unit: string
  market: string
  change: number
  changePercent: number
  updatedAt: Date
}

interface EcosystemSite {
  id: string
  name: string
  description: string
  url: string
  logoUrl?: string
  category: EcosystemCategory
  isLive?: boolean
  tags: string[]
}
```

---

## Contexto de la app

```typescript
// lib/app-context.tsx
interface AppState {
  currentScreen: 'splash' | 'onboarding' | 'main'
  onboarding: {
    step: number           // 0-3
    name: string
    profession: Profession | null
    department: Department | null
    preferences: NewsCategory[]
    isComplete: boolean
  }
  user: UserProfile | null
  activeTab: 'home' | 'prices' | 'ecosystem' | 'profile'
}
```

---

## Reglas de desarrollo

1. **Dark theme como default** — la app es principalmente oscura
2. **TypeScript estricto** — sin `any`, tipar todo
3. **Español** — toda la UI en español, contexto paraguayo
4. **Mobile-first** — diseñar para 390px (iPhone 14 Pro) como referencia
5. **Sin comentarios obvios** — solo comentar el *por qué*, nunca el *qué*
6. **Componentes small** — si un componente supera ~150 líneas, dividirlo
7. **Constants extraídas** — nunca hardcodear colores o strings en componentes
8. **Moneda:** Precios ganaderos en PYG (₲), commodities en USD ($)

---

## Assets existentes

| Asset | Descripción |
|---|---|
| `logo.png` | Logo principal de Agroconecta (160×48px) |
| `icon.svg` | Ícono escalable |
| `apple-icon.png` | Ícono para iOS |
| `placeholder.jpg` / `placeholder.svg` | Imagen fallback para noticias |
| `placeholder-user.jpg` | Avatar de usuario por defecto |

---

## Ecosistema — Productos actuales

| Producto | Categoría | Estado |
|---|---|---|
| Eventosagropy | eventos | Activo |
| Agrojuego | juegos | Activo |
| Agroconecta | institucional | Activo |
| (4+ proyectos) | varios | Coming Soon |

---

## Comandos útiles

```bash
# Iniciar servidor de desarrollo
npx expo start

# Correr en simulador iOS
npx expo run:ios

# Correr en emulador Android
npx expo run:android

# Verificar tipos
npx tsc --noEmit

# Limpiar caché
npx expo start --clear
```

---

## Estado del proyecto (2026-05-07)

- [x] Análisis del proyecto web original (Next.js)
- [x] Definición del design system en React Native
- [ ] Scaffold inicial de Expo Router
- [ ] Migración de tipos y mock data
- [ ] Implementación del design system (tokens + componentes base)
- [ ] Pantalla Splash
- [ ] Flujo Onboarding
- [ ] Tab: Home (feed de noticias)
- [ ] Tab: Precios
- [ ] Tab: Ecosistema
- [ ] Tab: Perfil
- [ ] Persistencia de usuario (AsyncStorage)
- [ ] Modo claro/oscuro
