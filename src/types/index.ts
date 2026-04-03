export type Language = 'en' | 'ja' | 'zh-TW' | 'zh-CN' | 'ko';

export type Area = 'sannomiya' | 'motomachi' | 'kitano' | 'nankinmachi' | 'surroundings';

export interface Spot {
  id: string;
  name: string;
  area: Area;
  category: string[];
  latitude?: number;
  longitude?: number;
  budget_min?: number;
  budget_max?: number;
  vibe_tags: string[];
  solo_friendly: boolean;
  foreigner_friendly: boolean;
  english_menu: boolean;
  cashless: boolean;
  opening_hours: Record<string, string>;
  reservation_url?: string;
  google_maps_url: string;
  priority_score: number;
  internal_notes?: string;
  caution_notes?: string;
  is_published: boolean;
  // Joined translation
  description?: string;
  highlight?: string;
  caution?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  spots?: Spot[];
  isLoading?: boolean;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  language?: Language;
}

export interface ChatResponse {
  reply: string;
  spots: Spot[];
  conversationId: string;
  language: Language;
}
