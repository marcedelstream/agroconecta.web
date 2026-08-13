// User types
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profession: Profession;
  department: Department;
  preferences: NewsCategory[];
  organizationSubscriptions: string[];
  mediaPreferences: string[];
  notificationPrefs?: NotificationPreferences;
  /** Orden elegido por el usuario para las bandas de Inicio (ver HOME_SECTION_KEYS en lib/home-sections.ts). */
  sectionOrder?: string[];
  /** Membresía anual individual — habilita el botón "+" para publicar. Se activa a mano desde Supabase por ahora, no hay pago in-app. */
  isMember?: boolean;
  createdAt: Date;
}

export type Profession =
  | 'productor'
  | 'comunicador'
  | 'veterinario'
  | 'agronomo'
  | 'comerciante'
  | 'transportista'
  | 'estudiante'
  | 'otro';

export type Department =
  | 'asuncion'
  | 'central'
  | 'alto-parana'
  | 'itapua'
  | 'caaguazu'
  | 'san-pedro'
  | 'canindeyu'
  | 'paraguari'
  | 'cordillera'
  | 'guaira'
  | 'caazapa'
  | 'misiones'
  | 'neembucu'
  | 'amambay'
  | 'concepcion'
  | 'presidente-hayes'
  | 'boqueron'
  | 'alto-paraguay';

export type NewsCategory =
  | 'ganaderia'
  | 'agricultura'
  | 'clima'
  | 'mercados'
  | 'tecnologia'
  | 'institucional';

export type OrganizationType =
  | 'media'
  | 'asociacion'
  | 'institucion'
  | 'gremio'
  | 'rematadora'
  | 'empresa';

export type CommercialStatus = 'trial' | 'active' | 'overdue' | 'paused';

export type AllyPlan = 'semilla' | 'cosecha';

export type AllyCategory =
  | 'agricultura'
  | 'ganaderia'
  | 'servicios'
  | 'medios'
  | 'instituciones'
  | 'insumos_maquinaria'
  | 'tecnologia'
  | 'otros';

export const ALLY_PLAN_LABELS: Record<AllyPlan, string> = {
  semilla: 'Aliado Semilla',
  cosecha: 'Aliado Cosecha',
};

export const ALLY_CATEGORY_LABELS: Record<AllyCategory, string> = {
  agricultura: 'Agricultura',
  ganaderia: 'Ganadería',
  servicios: 'Servicios',
  medios: 'Medios',
  instituciones: 'Instituciones',
  insumos_maquinaria: 'Insumos y Maquinaria',
  tecnologia: 'Tecnología',
  otros: 'Otros',
};

export interface Organization {
  id: string;
  slug: string;
  name: string;
  description: string;
  isVerified: boolean;
  category: OrganizationType;
  commercialStatus: CommercialStatus;
  planName: string;
  planStartedAt?: Date;
  billingNotes?: string;
  logoUrl?: string;
  eventsOrganizerSlug?: string;
  allyPlan?: AllyPlan;
  allyCategory?: AllyCategory;
  allyFounder?: boolean;
  contactPhone?: string;
}

export type Publisher = Organization;

export type EditorialStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
export type ContentType = 'article' | 'video' | 'auction' | 'institutional_notice';
export type AuctionStatus = 'upcoming' | 'live' | 'finished' | 'unavailable';

export interface Post {
  id: string;
  slug?: string;
  title: string;
  summary: string;
  content: string;
  contentType?: ContentType;
  editorialStatus?: EditorialStatus;
  isImportant?: boolean;
  category: NewsCategory;
  imageUrl: string;
  source: string;
  organizationId?: string;
  organizationLogoUrl?: string;
  organizationSlug?: string;
  publisherId?: string;
  targetDepartments?: Department[];
  authorName?: string;
  publishedAt: Date;
  readTime: number;
  isHighlighted?: boolean;
  youtubeUrl?: string;
  auctionStatus?: AuctionStatus;
  startsAt?: Date;
  eventTag?: string;
}

export type NewsArticle = Post;

export interface UserSubscription {
  id: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
}

// Prices types
export interface CattlePrice {
  id: string;
  category: string;
  pricePerKg: number;
  change: number;
  changePercent: number;
  unit: string;
  updatedAt: Date;
}

export interface InternationalPrice {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  change: number;
  changePercent: number;
  market: string;
  updatedAt: Date;
}

export type MarketPriceKind = 'cattle' | 'international';

export interface MarketPrice {
  id: string;
  kind: MarketPriceKind;
  label: string;
  market: string;
  currency: 'PYG' | 'USD';
  unit: string;
  value: number;
  change: number;
  changePercent: number;
  updatedAt: Date;
}

// Ficha única de Ecosistema (boceto 4f): empleo, clasificado y curso comparten un
// mismo molde de datos — todavía sin backend propio, se carga desde el admin cuando exista.
export type EcosystemListingKind = 'empleo' | 'clasificado' | 'curso';

export interface EcosystemListing {
  id: string;
  slug?: string;
  kind: EcosystemListingKind;
  title: string;
  location: string;
  modality: string;
  description: string;
  imageUrl?: string;
  categoryLabel: string;
  publisherName: string;
  publishedAt: Date;
  contactUrl?: string;
}

export type EcosystemCategory = 'eventos' | 'juegos' | 'institucional' | 'streaming'
export type ActiveTab = 'home' | 'prices' | 'videos' | 'ecosystem' | 'profile'

// Video types
export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  channel: string;
  category: NewsCategory;
  views: number;
  publishedAt: Date;
  videoUrl?: string;
  youtubeUrl?: string;
  contentType?: 'video' | 'auction';
  auctionStatus?: AuctionStatus;
  startsAt?: Date;
  organizationId?: string;
}

// Ecosystem types
export interface EcosystemSite {
  id: string;
  name: string;
  description: string;
  url: string;
  logoUrl?: string;
  category: EcosystemCategory;
  isLive?: boolean;
  isAvailable: boolean;
  tags: string[];
}

// Institution types
export interface InstitutionNews {
  id: string;
  title: string;
  content: string;
  institution: string;
  institutionLogo: string;
  publishedAt: Date;
  type: 'resolucion' | 'comunicado' | 'alerta' | 'normativa';
}

// Biblioteca digital
export type LibraryCategory = 'manual' | 'revista' | 'tecnico' | 'historia' | 'legislacion' | 'otros';

export const LIBRARY_CATEGORY_LABELS: Record<LibraryCategory, string> = {
  manual: 'Manual',
  revista: 'Revista',
  tecnico: 'Técnico',
  historia: 'Historia',
  legislacion: 'Legislación',
  otros: 'Otros',
};

export interface LibraryItem {
  id: string;
  title: string;
  author?: string;
  description: string;
  category: LibraryCategory;
  coverImageUrl: string;
  fileUrl: string;
  fileType: string;
  pageCount?: number;
  createdAt: Date;
}

export interface UserLibraryEntry {
  itemId: string;
  addedAt: Date;
  lastOpenedAt?: Date;
  progressPercent: number;
}

// Theme
export type AppTheme = 'dark' | 'light'

// Ad segmentation
export interface AdSegment {
  profession: Profession;
  department: Department;
  categories: NewsCategory[];
}

export interface MockAd {
  id: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  iconName: string;
  accentColor: string;
  imageUrl?: string;
  targetProfessions?: Profession[];
  targetDepartments?: Department[];
  targetCategories?: NewsCategory[];
}

export type AdLinkType = 'event' | 'post' | 'url' | 'course';

export type AdPlacement = 'home' | 'article' | 'precios' | 'videos';

export interface AdCampaign {
  id: string;
  title: string;
  imageUrl: string;
  placement: AdPlacement[];
  targetProfessions: Profession[];
  targetDepartments: Department[];
  targetCategories: NewsCategory[];
  startsAt: Date;
  endsAt?: Date;
  isActive: boolean;
  linkType?: AdLinkType;
  linkTarget?: string;
}

// Notification preferences
export interface NotificationPreferences {
  breakingNews: boolean;
  priceAlerts: boolean;
  weatherAlerts: boolean;
  institutionalUpdates: boolean;
}

// Event types (source: eventosagropy.com Supabase)
export interface AgroEvent {
  id: string
  title: string
  description: string
  longDescription?: string
  category: string
  date: string
  endDate?: string
  time?: string
  location: string
  city?: string
  department?: string
  imageUrl?: string
  internalBannerUrl?: string
  slug: string
  isPremium: boolean
  speakers?: string[]
  importantLinks?: { label: string; url: string }[]
  mapsUrl?: string
  contactEmail?: string
  contactPhone?: string
  organizationId?: string
  createdAt: string
}

// Programa de un evento (gestionado en Agroconecta, asociado por slug al evento externo)
export interface EventScheduleItem {
  id: string
  eventSlug: string
  dayLabel?: string
  time?: string
  title: string
  description?: string
  speaker?: string
  orderIndex: number
}

// Onboarding state
export interface OnboardingState {
  step: number;
  name: string;
  email: string;
  phone: string;
  profession: Profession | null;
  department: Department | null;
  preferences: NewsCategory[];
  organizationSubscriptions: string[];
  mediaPreferences: string[];
  isComplete: boolean;
}
