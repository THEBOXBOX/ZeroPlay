// 로컬 스팟 관련 TypeScript 타입 정의

export type SpotCategory = 'experience' | 'culture' | 'restaurant' | 'deal';

export interface OperatingHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface LocalSpot {
  id: string;
  name: string;
  category: SpotCategory;
  subcategory?: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  instagram?: string;
  operating_hours?: OperatingHours;
  price_range?: string;
  images?: string[];
  tags?: string[];
  youth_friendly: boolean;
  reservation_required: boolean;
  reservation_link?: string;
  is_active: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface LocalDeal {
  id: string;
  spot_id: string;
  title: string;
  description?: string;
  discount_rate?: number;
  discount_amount?: number;
  original_price?: number;
  discounted_price?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_usage?: number;
  current_usage: number;
  terms_and_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
}

export interface SpotReview {
  id: string;
  spot_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// API 응답 타입
export interface LocalSpotWithDeals extends LocalSpot {
  deals?: LocalDeal[];
}

export interface LocalSpotWithDistance extends LocalSpot {
  distance?: number; // km 단위
}

// 필터링 옵션
export interface SpotFilters {
  category?: SpotCategory[];
  subcategory?: string[];
  priceRange?: string[];
  youthFriendly?: boolean;
  hasDeals?: boolean;
  withinDistance?: number; // km
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

// 지도 마커 데이터
export interface MapMarkerData {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  category: SpotCategory;
  name: string;
  hasDeals: boolean; // 핫딜 여부로 마커 스타일 구분
}

// 카테고리 정보 (3개 + 핫딜 필터)
export interface CategoryInfo {
  key: SpotCategory | 'experience' | 'culture' | 'restaurant' | 'cafe' | 'deal';
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'experience',
    name: '체험',
    icon: '🎨',
    color: '#FF6B6B',
    subcategories: ['공방', '원데이클래스', '액티비티', 'DIY체험', '쿠킹클래스']
  },
  {
    key: 'culture',
    name: '문화',
    icon: '📚',
    color: '#4ECDC4',
    subcategories: ['독립서점', '갤러리', '전시공간', '문화센터', '공연장']
  },
  {
    key: 'restaurant',
    name: '맛집',
    icon: '🍽️',
    color: '#45B7D1',
    subcategories: ['한식', '양식', '일식', '중식', '분식', '치킨', '고기']
  },
  {
    key: 'cafe',
    name: '카페',
    icon: '☕',
    color: '#8B5A3C',
    subcategories: ['청년카페', '브런치카페', '디저트카페', '로스터리', '북카페']
  },
  {
    key: 'deal',
    name: '핫딜',
    icon: '💰',
    color: '#96CEB4',
    subcategories: ['체험할인', '맛집할인', '카페할인', '숙박할인']
  }
];

// 유틸리티 함수들
export const getCategoryInfo = (category: SpotCategory): CategoryInfo => {
  return CATEGORIES.find(cat => cat.key === category) || CATEGORIES[0];
};

export const formatPriceRange = (priceRange?: string): string => {
  if (!priceRange) return '가격 정보 없음';
  return priceRange;
};

export const isSpotOpen = (operatingHours?: OperatingHours): boolean => {
  if (!operatingHours) return true; // 운영시간 정보 없으면 열린 것으로 간주
  
  const now = new Date();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const today = dayNames[now.getDay()];
  const todayHours = operatingHours[today as keyof OperatingHours];
  
  if (!todayHours || todayHours === '휴무') return false;
  
  // 간단한 운영시간 체크 (예: "09:00-18:00")
  const [openTime, closeTime] = todayHours.split('-');
  if (!openTime || !closeTime) return true;
  
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const openTimeNum = parseInt(openTime.replace(':', ''));
  const closeTimeNum = parseInt(closeTime.replace(':', ''));
  
  return currentTime >= openTimeNum && currentTime <= closeTimeNum;
};