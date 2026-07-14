import type { Ionicons } from '@expo/vector-icons'

export interface SocialLink {
  id: string
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  url: string
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', url: 'https://www.tiktok.com/@agroconecta.py?lang=es-419' },
  { id: 'youtube', label: 'YouTube', icon: 'logo-youtube', url: 'https://www.youtube.com/@agroconectapy' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin', url: 'https://www.linkedin.com/company/agroconectapy/' },
  { id: 'x', label: 'X', icon: 'logo-x', url: 'https://x.com/agroconectapy' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook', url: 'https://www.facebook.com/agroconectapy' },
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram', url: 'https://www.instagram.com/agroconectapy/' },
]

export const WHATSAPP_NUMBER = '+595 986 945 816'
export const WHATSAPP_URL = 'https://wa.me/595986945816'
