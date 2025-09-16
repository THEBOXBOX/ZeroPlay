// src/types/spots.ts
export interface SpotData {
  id: string;
  name: string;
  category: 'experience' | 'culture' | 'restaurant' | 'cafe';
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  operating_hours?: Record<string, string>;
  price_range?: string;
  images?: string[];
  reservation_link?: string;
  rating?: number;
  review_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  distance?: number;
}

export type CategoryType = 'experience' | 'culture' | 'restaurant' | 'cafe';

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  apiValue: string;
}