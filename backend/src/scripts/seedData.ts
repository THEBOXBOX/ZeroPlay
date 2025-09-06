import type { SupabaseClient } from '@supabase/supabase-js';

export async function seedData(supabase: SupabaseClient): Promise<void> {
  console.log('🌱 시드 데이터 삽입 시작...');

  const { error: keywordError } = await supabase.from('hot_keywords').upsert([
    { keyword_code: 'OCEAN_VIEW',  keyword_name: '바다뷰',   emoji: '🌊', is_seasonal: false, trend_score: 95 },
    { keyword_code: 'COFFEE_TOUR', keyword_name: '카페투어', emoji: '☕', is_seasonal: false, trend_score: 88 },
    { keyword_code: 'LOCAL_FOOD',  keyword_name: '로컬맛집', emoji: '🍜', is_seasonal: false, trend_score: 92 },
    { keyword_code: 'PHOTO_SPOT',  keyword_name: '인스타명소', emoji: '📸', is_seasonal: false, trend_score: 85 },
  ], { onConflict: 'keyword_code' });
  if (keywordError) throw keywordError;

  const { error: convenienceError } = await supabase.from('convenience_features').upsert([
    { feature_code: 'PARKING',         feature_name: '주차가능',     icon: '🅿️', category: 'ACCESSIBILITY' },
    { feature_code: 'PET_FRIENDLY',    feature_name: '반려동물 동반', icon: '🐕', category: 'SPECIAL' },
    { feature_code: 'RAIN_ALTERNATIVE',feature_name: '우천시 대안',   icon: '☔', category: 'SERVICE' },
  ], { onConflict: 'feature_code' });
  if (convenienceError) throw convenienceError;

  const { error: packageError } = await supabase.from('travel_packages').upsert([
    {
      title: '강릉 바다뷰 카페투어', description: '강릉의 아름다운 바다를 보며 즐기는 특별한 카페투어',
      region_code: 'GANGWON', duration_days: 1, min_budget: 50000, max_budget: 80000,
      budget_category: 'VALUE', companion_type: 'COUPLE', max_group_size: 2,
      theme: 'HEALING', average_rating: 4.7, total_reviews: 128, popularity_score: 95, is_active: true
    },
    {
      title: '부산 감천문화마을 포토투어', description: '알록달록한 감천문화마을에서의 인스타그램 명소 투어',
      region_code: 'BUSAN', duration_days: 0, min_budget: 30000, max_budget: 50000,
      budget_category: 'ULTRA_SAVE', companion_type: 'FRIENDS', max_group_size: 4,
      theme: 'HOTPLACE', average_rating: 4.5, total_reviews: 89, popularity_score: 87, is_active: true
    },
    {
      title: '경주 역사문화 힐링여행', description: '천년 고도 경주에서 만나는 역사와 자연의 조화',
      region_code: 'GYEONGBUK', duration_days: 2, min_budget: 120000, max_budget: 180000,
      budget_category: 'MODERATE', companion_type: 'FAMILY', max_group_size: 4,
      theme: 'HEALING', average_rating: 4.6, total_reviews: 156, popularity_score: 82, is_active: true
    }
  ], { onConflict: 'title' });
  if (packageError) throw packageError;

  console.log('🎉 모든 시드 데이터 삽입 완료!');
}
