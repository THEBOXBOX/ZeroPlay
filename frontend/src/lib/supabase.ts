import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// travel_destinations 테이블 활용 API 함수들
export const travelApi = {
  // 여행 추천 가져오기 - travel_destinations 테이블에서 직접
  async getRecommendations(params: {
    budget: number;
    interests: string[];
    duration: string;
    companions: string;
  }) {
    try {
      console.log('travel_destinations 테이블에서 추천 데이터 조회 시작:', params);

      // travel_destinations 테이블 조회
      console.log('기본 travel_destinations 테이블 조회 시작...');
      
      let query = supabase
        .from('travel_destinations')
        .select('*');

      // 점수 높은 순으로 정렬
      query = query.order('score', { ascending: false });

      const { data, error } = await query.limit(12) as any;

      if (error) {
        console.error('기본 쿼리도 실패:', error);
        // 더 단순한 쿼리 시도
        const { data: simpleData, error: simpleError } = await supabase
          .from('travel_destinations')
          .select('id, name')
          .limit(5);
          
        if (simpleError) {
          console.error('가장 단순한 쿼리도 실패:', simpleError);
          throw new Error(`데이터베이스 연결 오류: ${simpleError.message}`);
        }
        
        console.log('단순 쿼리 성공:', simpleData);
        throw new Error(`복잡한 쿼리 실패, 단순 쿼리는 성공`);
      }

      console.log('travel_destinations 조회 결과:', data);

      // 프론트엔드 인터페이스에 맞게 데이터 변환
      const formattedData = (data || []).map((item: any) => ({
        id: item.id,
        title: item.name,
        budget: this.estimateBudget(item.price_range, params.budget || 50000),
        duration: `${item.duration_hours || 2}시간`,
        highlights: this.safeParseArray(item.tags),
        description: item.description || '멋진 여행지',
        location: item.address || `${item.region} 지역`,
        region: item.region,
        category: item.category,
        rating: item.rating || 4.0,
        
        // 호환성 필드들
        place_name: item.name,
        place_type: item.place_type || item.category?.toUpperCase(),
        avg_stay_minutes: item.avg_stay_minutes || 120,
        entry_fee: item.entry_fee || 0,
        score: item.score || item.rating || 4.0,

        estimatedCost: {
          transportation: Math.floor((params.budget || 50000) * 0.3),
          accommodation: Math.floor((params.budget || 50000) * 0.4),
          food: Math.floor((params.budget || 50000) * 0.3)
        }
      }));

      return {
        success: true,
        data: formattedData
      };

    } catch (error) {
      console.error('추천 데이터 가져오기 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  },

  // 안전한 배열 파싱
  safeParseArray(value: any): string[] {
    if (!value) return ['여행', '추천'];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return ['여행', '추천'];
  },

  // 예산 추정
  estimateBudget(priceRange: string, originalBudget: number): number {
    const budgetMap: { [key: string]: number } = {
      'budget_low': Math.min(originalBudget, 30000),
      'budget_medium': Math.min(originalBudget, 70000),
      'budget_high': Math.min(originalBudget, 150000)
    };
    return budgetMap[priceRange] || originalBudget || 50000;
  },

  // 지역별 장소 가져오기
  async getLocalExperiences(region: string) {
    try {
      console.log('지역별 장소 조회:', region);

      const { data, error } = await supabase
        .from('travel_destinations')
        .select('*')
        .eq('region', region.toUpperCase())
        .order('score', { ascending: false })
        .limit(20);

      if (error) {
        console.error('지역별 장소 조회 오류:', error);
        throw new Error(`데이터베이스 오류: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('지역별 장소 가져오기 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  },

  // 장소 상세 정보
  async getDestinationDetail(id: string) {
    try {
      console.log('장소 상세 정보 조회:', id);

      const { data, error } = await supabase
        .from('travel_destinations')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (error) {
        console.error('장소 상세 정보 조회 오류:', error);
        throw new Error(`데이터베이스 오류: ${error.message}`);
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('장소 상세 정보 가져오기 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  },

  // 청년 혜택 정보 가져오기 (더미 데이터)
  async getYouthBenefits() {
    try {
      console.log('청년 혜택 데이터 반환 (더미 데이터)');
      
      // 실제 테이블이 없으므로 하드코딩된 데이터 반환
      return {
        success: true,
        data: [
          {
            id: 1,
            title: '청년 문화패스',
            category: '문화',
            discount: '월 5만원 지원',
            eligibility: '만 18~34세',
            description: '영화, 공연, 전시 등 문화활동 지원'
          },
          {
            id: 2,
            title: 'KTX 청년 할인',
            category: '교통',
            discount: '최대 30% 할인',
            eligibility: '만 13~28세',
            description: '고속철도 요금 할인'
          },
          {
            id: 3,
            title: '청년 숙박할인',
            category: '숙박',
            discount: '15~25% 할인',
            eligibility: '만 19~29세',
            description: '제휴 숙박시설 할인'
          },
          {
            id: 4,
            title: '관광지 청년할인',
            category: '관광',
            discount: '입장료 20% 할인',
            eligibility: '만 18~34세',
            description: '주요 관광지 입장료 할인'
          }
        ]
      };

    } catch (error) {
      console.error('청년 혜택 가져오기 실패:', error);
      return {
        success: true, // 혜택 데이터는 선택사항이므로 실패해도 success
        data: []
      };
    }
  },

  // 연결 테스트 함수
  async testConnection() {
    try {
      console.log('Supabase 연결 테스트 시작');

      // travel_destinations 테이블로 연결 테스트
      const { data, error } = await supabase
        .from('travel_destinations')
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('Supabase 연결 실패:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('Supabase 연결 성공! travel_destinations 테이블 접근 가능');
      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('연결 테스트 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '연결 실패'
      };
    }
  },

  // 타입별 장소 조회 (추가 기능)
  async getPlacesByType(placeType: string) {
    try {
      console.log('타입별 장소 조회:', placeType);

      const { data, error } = await supabase
        .from('travel_destinations')
        .select('*')
        .eq('place_type', placeType.toUpperCase())
        .order('score', { ascending: false })
        .limit(15);

      if (error) {
        throw new Error(`데이터베이스 오류: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('타입별 장소 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }
};

// 기존 백엔드 API 호출 함수들 (백업용)
export const backendApi = {
  async getRecommendations(params: {
    budget: number;
    interests: string[];
    duration: string;
    companions: string;
  }) {
    const response = await fetch('/api/travel/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    return response.json();
  },

  async getLocalExperiences(region: string) {
    const response = await fetch(`/api/travel/local-experiences/${region}`);

    if (!response.ok) {
      throw new Error('Failed to fetch local experiences');
    }

    return response.json();
  },

  async getDestinationDetail(id: string) {
    const response = await fetch(`/api/travel/destination/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch destination detail');
    }

    return response.json();
  }
};