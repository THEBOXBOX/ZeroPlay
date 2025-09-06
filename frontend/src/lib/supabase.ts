import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Places 테이블 활용 API 함수들
export const travelApi = {
  // 여행 추천 가져오기 - places 테이블에서 직접
  async getRecommendations(params: {
    budget: number;
    interests: string[];
    duration: string;
    companions: string;
  }) {
    try {
      console.log('Places 테이블에서 추천 데이터 조회 시작:', params);

      // 단순한 places 테이블 조회부터 시작
      console.log('기본 places 테이블 조회 시작...');
      
      let query = supabase
        .from('places')
        .select('*');

      // 점수 높은 순으로 정렬
      query = query.order('score', { ascending: false });

      const { data, error } = await query.limit(12) as any;

      if (error) {
        console.error('기본 쿼리도 실패:', error);
        // 더 단순한 쿼리 시도
        const { data: simpleData, error: simpleError } = await supabase
          .from('places')
          .select('id, place_name')
          .limit(5);
          
        if (simpleError) {
          console.error('가장 단순한 쿼리도 실패:', simpleError);
          throw new Error(`데이터베이스 연결 오류: ${simpleError.message}`);
        }
        
        console.log('단순 쿼리 성공:', simpleData);
        throw new Error(`복잡한 쿼리 실패, 단순 쿼리는 성공`);
      }

      if (error) {
        console.error('Supabase 쿼리 오류:', error);
        throw new Error(`데이터베이스 오류: ${error?.message || JSON.stringify(error)}`);
      }

      console.log('Places 조회 결과:', data);
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('추천 데이터 가져오기 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  },

  // 지역별 장소 가져오기
  async getLocalExperiences(region: string) {
    try {
      console.log('지역별 장소 조회:', region);

      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          cities (
            city_name,
            regions (
              region_name
            )
          )
        `)
        .eq('cities.regions.region_name', region)
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
        .from('places')
        .select(`
          *,
          cities (
            city_name,
            city_code,
            latitude,
            longitude,
            regions (
              region_name,
              region_code
            )
          )
        `)
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

      // places 테이블로 연결 테스트
      const { data, error } = await supabase
        .from('places')
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('Supabase 연결 실패:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('Supabase 연결 성공! Places 테이블 접근 가능');
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
        .from('places')
        .select(`
          *,
          cities (
            city_name,
            regions (
              region_name
            )
          )
        `)
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