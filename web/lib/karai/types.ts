export type ScopeCategory =
  | 'agro_information'
  | 'farm_management'
  | 'commercial_opportunity'
  | 'agroconecta_content'
  | 'karai_support'
  | 'general_greeting'
  | 'out_of_scope'
  | 'unsafe_or_abusive'

export const BLOCKED_CATEGORIES: ScopeCategory[] = ['out_of_scope', 'unsafe_or_abusive']

export type KaraiChannel = 'web' | 'whatsapp'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
