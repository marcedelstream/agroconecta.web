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

export interface Organization {
  id: string;
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
}

export type Publisher = Organization;

export type EditorialStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
export type ContentType = 'article' | 'video' | 'auction' | 'institutional_notice';
export type AuctionStatus = 'upcoming' | 'live' | 'finished' | 'unavailable';

export interface Post {
  id: string;
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

export interface AdCampaign {
  id: string;
  title: string;
  imageUrl: string;
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
