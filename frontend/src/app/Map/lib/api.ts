// src/app/Map/lib/api.ts - 안전한 버전 (이모지 제거)
export interface LocalSpot {
  id: string;
  name: string;
  category: 'experience' | 'culture' | 'restaurant' | 'cafe';
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  operating_hours?: any;
  price_range?: string;
  images?: string[];
  reservation_link?: string;
  rating?: number;
  review_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  spots: LocalSpot[];
  filters: {
    category: string | null;
    limit: number;
  };
  error?: string;
}

// 🔥 안전한 API 호출 함수
export async function fetchLocalSpots(
  category?: string,
  limit: number = 50
): Promise<ApiResponse> {
  try {
    console.log('🔍 [Map] API 호출 시작:', { category, limit });
    
    // URL 파라미터 구성
    const params = new URLSearchParams();
    if (category && category !== '전체') {
      params.append('category', category);
    }
    params.append('limit', limit.toString());

    const url = `/api/spots?${params.toString()}`;
    console.log('📡 [Map] 요청 URL:', url);

    // API 호출
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 [Map] 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    console.log('✅ [Map] API 응답 성공:', data);

    return data;
  } catch (error) {
    console.error('❌ [Map] API 호출 실패:', error);
    
    // 실패해도 안전한 형태로 반환
    return {
      success: false,
      count: 0,
      spots: [],
      filters: { category: category || null, limit },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 🔥 카테고리별 한글-영문 매핑
export const CATEGORY_MAP = {
  '전체': null,
  '체험': 'experience',
  '문화': 'culture', 
  '맛집': 'restaurant',
  '카페': 'cafe',
} as const;

// 🔥 영문-한글 매핑 (역방향)
export const CATEGORY_MAP_REVERSE = {
  experience: '체험',
  culture: '문화',
  restaurant: '맛집',
  cafe: '카페',
} as const;

// 🔥 카테고리 텍스트 매핑 (이모지 대신 안전한 텍스트)
export const CATEGORY_LABELS = {
  experience: 'EX',
  culture: 'CU',
  restaurant: 'RE',
  cafe: 'CA',
} as const;

// 🔥 카테고리 한글 이름
export const CATEGORY_NAMES = {
  experience: '체험',
  culture: '문화',
  restaurant: '맛집',
  cafe: '카페',
} as const;

// 🔥 카테고리 색상 매핑 (핀 색상용)
export const CATEGORY_COLORS = {
  experience: '#FF195E', // 빨간색
  culture: '	#FFED4C',    // 노란색
  restaurant: '#00327F', // 파란색
  cafe: '	#95E544',       // 초록색
} as const;