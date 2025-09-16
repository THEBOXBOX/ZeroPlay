import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 환경변수 검증
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 Supabase 환경변수가 설정되지 않았습니다.');
  console.log('필요한 환경변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 연결 테스트
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('benefits').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase 연결 성공');
    return true;
  } catch (err) {
    console.error('🔴 Supabase 연결 실패:', err);
    return false;
  }
}

// === 타입 정의 ===
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

export interface Benefit {
  id: number;
  title: string;
  provider: string;
  amount: string;
  amount_type: 'free' | 'cash' | 'discount_rate' | 'coupon';
  target_summary: string;
  period_text: string;
  description: string;
  category_id: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}