import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js';

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 타입 정의
export interface TravelPackage {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  region_code: string;
  duration_days: number;
  min_budget: number;
  max_budget: number;
  budget_category: 'ULTRA_SAVE' | 'VALUE' | 'MODERATE' | 'COMFORTABLE' | 'LUXURY';
  companion_type: 'SOLO' | 'COUPLE' | 'FRIENDS' | 'FAMILY';
  max_group_size?: number;
  theme: 'HEALING' | 'HOTPLACE' | 'FOODIE' | 'ACTIVITY' | 'ROMANTIC';
  average_rating?: number;
  total_reviews?: number;
  popularity_score?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HotKeyword {
  id: number;
  keyword_code: string;
  keyword_name: string;
  emoji?: string;
  is_seasonal?: boolean;
  season_months?: string;
  trend_score?: number;
}

export interface ItineraryItem {
  id: number;
  package_id: number;
  day_number: number;
  sequence_order: number;
  activity_type: 'TRANSPORT' | 'ATTRACTION' | 'RESTAURANT' | 'ACCOMMODATION' | 'ACTIVITY';
  place_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  cost_per_person?: number;
  is_optional?: boolean;
  description?: string;
  tips?: string;
  photo_urls?: string[];
}