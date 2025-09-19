import OpenAI from 'openai';
import { supabase } from '../config/supabase';

export interface TravelFilter {
  budget: string;
  duration: string;
  companions: string;
  interests: string[];
  region: string;
}

export interface Place {
  id: number;
  name: string;
  region: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price_range: string;
  duration_hours: number;
  companion_type: string[];
  tags: string[];
  rating: number;
  image_url: string;
  score: number;
  avg_stay_minutes: number;
  entry_fee: number;
  place_type: string;
}

export interface RouteRecommendation {
  id: string;
  title: string;
  duration: string;
  totalBudget: number;
  places: {
    name: string;
    type: string;
    duration: string;
    cost: number;
    description: string;
  }[];
  highlights: string[];
  difficulty: 'easy' | 'moderate' | 'hard';
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 필터 조건에 맞는 관광지 검색 (1차 필터링)
   */
  async searchPlacesByFilter(filter: TravelFilter): Promise<Place[]> {
    try {
      let query = supabase
        .from('travel_destinations')
        .select('*')
        .limit(50);

      // 지역 필터
      if (filter.region && filter.region !== '') {
        query = query.eq('region', this.mapRegionToCode(filter.region));
      }

      // 예산 필터
      if (filter.budget) {
        const budgetRange = this.mapBudgetRange(filter.budget);
        if (budgetRange) {
          query = query.eq('price_range', budgetRange);
        }
      }

      // 동행자 필터
      if (filter.companions) {
        const companionType = this.mapCompanionType(filter.companions);
        query = query.contains('companion_type', [companionType]);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching places by filter:', error);
      return [];
    }
  }

  /**
   * 사용자 메시지와 필터를 기반으로 RAG 검색 수행
   */
  async performRAGSearch(userMessage: string, filter: TravelFilter): Promise<Place[]> {
    try {
      // 1차: 필터로 후보 축소
      const candidatePlaces = await this.searchPlacesByFilter(filter);
      
      if (candidatePlaces.length === 0) {
        return [];
      }

      // 2차: 임베딩을 통한 의미적 검색 (간단한 키워드 매칭으로 대체)
      const searchResults = await this.semanticSearch(userMessage, candidatePlaces, filter.interests);
      
      return searchResults.slice(0, 15); // 최대 15개 장소 반환
    } catch (error) {
      console.error('Error in RAG search:', error);
      return [];
    }
  }

  /**
   * 간단한 의미적 검색 (키워드 기반)
   */
  private async semanticSearch(userMessage: string, places: Place[], interests: string[]): Promise<Place[]> {
    const searchTerms = [
      ...userMessage.toLowerCase().split(' '),
      ...interests.map(i => i.toLowerCase())
    ];

    const scoredPlaces = places.map(place => {
      let score = place.score || 4.0; // 기본 점수
      
      // 이름, 설명, 태그에서 키워드 매칭
      const searchableText = [
        place.name,
        place.description,
        ...(place.tags || []),
        place.category,
        place.place_type
      ].join(' ').toLowerCase();

      // 키워드 점수 계산
      searchTerms.forEach(term => {
        if (searchableText.includes(term)) {
          score += 1.0;
        }
      });

      // 관심사 추가 점수
      interests.forEach(interest => {
        const interestKeywords = this.getInterestKeywords(interest);
        interestKeywords.forEach(keyword => {
          if (searchableText.includes(keyword)) {
            score += 2.0; // 관심사 매칭은 더 높은 점수
          }
        });
      });

      return { ...place, searchScore: score };
    });

    // 점수 순으로 정렬
    return scoredPlaces
      .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))
      .map(({ searchScore, ...place }) => place);
  }

  /**
   * AI를 활용한 여행 코스 생성 (Mock 버전)
   */
  async generateTravelRoutes(places: Place[], userMessage: string, filter: TravelFilter): Promise<RouteRecommendation[]> {
    try {
      console.log('🔧 OpenAI API 할당량 초과로 Mock 시스템 사용');
      console.log('📝 분석할 메시지:', userMessage);
      
      return this.createIntelligentMockRoutes(places, userMessage, filter);
    } catch (error) {
      console.error('Error in mock routes:', error);
      return this.createFallbackRoutes(places, filter);
    }
  }

  /**
   * 지능적인 Mock 코스 생성
   */
  private createIntelligentMockRoutes(places: Place[], userMessage: string, filter: TravelFilter): RouteRecommendation[] {
    if (places.length === 0) return [];
    
    console.log('🎯 Mock 코스 생성 시작, 사용 가능한 장소:', places.length);
    
    // 메시지와 필터 기반 장소 필터링
    let filteredPlaces = this.filterPlacesByMessage(places, userMessage);
    console.log('🔍 필터링된 장소:', filteredPlaces.length);
    
    // 부족하면 모든 장소 사용
    if (filteredPlaces.length < 3) {
      filteredPlaces = places.slice(0, 12); // 상위 12개 사용
    }
    
    // 3개 코스 생성
    const routes: RouteRecommendation[] = [];
    
    // 코스 1: 첫 번째 테마
    const route1Places = filteredPlaces.slice(0, 4);
    if (route1Places.length > 0) {
      routes.push(this.createMockRoute('1', route1Places, this.getThemeTitle(route1Places, userMessage)));
    }
    
    // 코스 2: 두 번째 테마
    const route2Places = filteredPlaces.slice(2, 6);
    if (route2Places.length > 0) {
      routes.push(this.createMockRoute('2', route2Places, this.getAlternativeTheme(route2Places, userMessage)));
    }
    
    // 코스 3: 세 번째 테마
    const route3Places = filteredPlaces.slice(4, 8);
    if (route3Places.length > 0) {
      routes.push(this.createMockRoute('3', route3Places, '추천 명소 투어'));
    }
    
    console.log('✅ Mock 코스 생성 완료:', routes.length, '개');
    return routes;
  }

  /**
   * 메시지 기반 장소 필터링
   */
  private filterPlacesByMessage(places: Place[], message: string): Place[] {
    const keywords = message.toLowerCase();
    let filtered = places;
    
    // 카테고리별 필터링
    if (keywords.includes('카페')) {
      filtered = places.filter(p => p.category === 'cafe');
    } else if (keywords.includes('맛집') || keywords.includes('음식') || keywords.includes('먹')) {
      filtered = places.filter(p => p.category === 'restaurant');
    } else if (keywords.includes('쇼핑') || keywords.includes('구매')) {
      filtered = places.filter(p => p.category === 'shopping');
    } else if (keywords.includes('관광') || keywords.includes('구경') || keywords.includes('명소')) {
      filtered = places.filter(p => p.category === 'attraction');
    }
    
    // 동행자별 필터링
    if (keywords.includes('연인') || keywords.includes('데이트')) {
      filtered = filtered.filter(p => p.companion_type?.includes('couple'));
    } else if (keywords.includes('친구')) {
      filtered = filtered.filter(p => p.companion_type?.includes('friends'));
    } else if (keywords.includes('가족')) {
      filtered = filtered.filter(p => p.companion_type?.includes('family'));
    } else if (keywords.includes('혼자') || keywords.includes('솔로')) {
      filtered = filtered.filter(p => p.companion_type?.includes('solo'));
    }
    
    // 가격 필터링
    if (keywords.includes('무료') || keywords.includes('저렴')) {
      filtered = filtered.filter(p => p.price_range === 'budget_free' || p.price_range === 'budget_low');
    }
    
    // 평점순 정렬
    return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * 개별 Mock 코스 생성
   */
  private createMockRoute(id: string, places: Place[], title: string): RouteRecommendation {
    const totalBudget = places.reduce((sum, p) => sum + (p.entry_fee || 0), 0);
    const totalDuration = places.reduce((sum, p) => sum + (p.duration_hours || 2), 0);
    
    return {
      id: `mock_route_${id}`,
      title,
      duration: `${totalDuration}시간`,
      totalBudget,
      places: places.map(p => ({
        name: p.name,
        type: p.category,
        duration: `${p.duration_hours || 2}시간`,
        cost: p.entry_fee || 0,
        description: p.description.slice(0, 100) + (p.description.length > 100 ? '...' : '')
      })),
      highlights: this.extractHighlights(places),
      difficulty: totalDuration <= 4 ? 'easy' : totalDuration <= 8 ? 'moderate' : 'hard'
    };
  }

  /**
   * 테마별 제목 생성
   */
  private getThemeTitle(places: Place[], message: string): string {
    const keywords = message.toLowerCase();
    const categories = places.map(p => p.category);
    
    if (keywords.includes('데이트') || keywords.includes('연인')) {
      return '로맨틱 데이트 코스';
    } else if (keywords.includes('친구')) {
      return '친구들과 함께하는 여행';
    } else if (keywords.includes('가족')) {
      return '가족 나들이 코스';
    } else if (categories.includes('cafe')) {
      return '카페 투어 코스';
    } else if (categories.includes('restaurant')) {
      return '맛집 탐방 코스';
    } else if (categories.includes('attraction')) {
      return '인기 관광지 코스';
    }
    
    return '추천 여행 코스';
  }

  /**
   * 대체 테마 생성
   */
  private getAlternativeTheme(places: Place[], message: string): string {
    const themes = ['힐링 여행 코스', '포토스팟 투어', '문화 체험 코스', '가성비 여행 코스'];
    return themes[Math.floor(Math.random() * themes.length)];
  }

  /**
   * 하이라이트 추출
   */
  private extractHighlights(places: Place[]): string[] {
    const allTags = places.flatMap(p => p.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.slice(0, 3);
  }

  /**
   * AI 프롬프트 생성
   */
  private buildPrompt(places: Place[], userMessage: string, filter: TravelFilter): string {
    const placesInfo = places.slice(0, 12).map((place, index) => 
      `${index + 1}. ${place.name} (${place.category}) - ${place.description} | 평점: ${place.rating} | 소요시간: ${place.duration_hours}시간 | 비용: ${place.entry_fee || 0}원 | 태그: ${place.tags?.join(', ')}`
    ).join('\n');

    return `
사용자 요청: "${userMessage}"

여행 조건:
- 예산: ${filter.budget}
- 기간: ${filter.duration}  
- 동행자: ${filter.companions}
- 관심사: ${filter.interests.join(', ')}
- 지역: ${filter.region}

🚨 중요: 아래 목록에 있는 장소들만 사용하세요 🚨

사용 가능한 관광지 목록:
${placesInfo}

규칙:
1. 위 목록에 없는 장소는 절대 사용하지 마세요
2. 장소명을 정확히 복사해서 사용하세요
3. 실제 비용(entry_fee)을 사용하세요
4. 사용자 요청 지역과 맞는 장소만 선택하세요

응답 형식 (반드시 이 JSON 구조를 따라주세요):
{
  "routes": [
    {
      "id": "route_1",
      "title": "매력적인 코스 제목",
      "duration": "6시간",
      "totalBudget": 23000,
      "places": [
        {
          "name": "경복궁",
          "type": "attraction",
          "duration": "3시간",
          "cost": 3000,
          "description": "조선왕조의 정궁으로 한국의 전통 문화 체험"
        }
      ],
      "highlights": ["핵심태그1", "핵심태그2", "핵심태그3"],
      "difficulty": "easy"
    }
  ]
}

⚠️ 경고: 목록에 없는 장소를 만들어내지 마세요!
`;
  }

  /**
   * AI 응답 파싱
   */
  private parseAIResponse(response: string, places: Place[]): RouteRecommendation[] {
    try {
      // JSON 부분 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 응답을 찾을 수 없습니다.');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const routes = parsed.routes || [];
      
      // 각 루트의 장소들이 실제 데이터베이스에 있는지 검증
      const validatedRoutes = routes.map((route: any) => {
        const validPlaces = route.places.filter((place: any) => {
          const exists = places.some(p => p.name === place.name);
          if (!exists) {
            console.warn('⚠️ AI가 존재하지 않는 장소를 생성:', place.name);
          }
          return exists;
        });
        
        // 유효한 장소가 없으면 이 루트는 제외
        if (validPlaces.length === 0) {
          console.warn('❌ 유효한 장소가 없는 루트 제외:', route.title);
          return null;
        }
        
        // 실제 데이터에서 정확한 정보 가져오기
        const correctedPlaces = validPlaces.map((place: any) => {
          const actualPlace = places.find(p => p.name === place.name);
          if (actualPlace) {
            return {
              name: actualPlace.name,
              type: actualPlace.category,
              duration: `${actualPlace.duration_hours}시간`,
              cost: actualPlace.entry_fee || 0,
              description: actualPlace.description
            };
          }
          return place;
        });
        
        // 총 예산 재계산
        const totalBudget = correctedPlaces.reduce((sum: number, p: any) => sum + p.cost, 0);
        
        return {
          ...route,
          places: correctedPlaces,
          totalBudget
        };
      }).filter((route: any) => route !== null);

      return validatedRoutes;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.createFallbackRoutes(places, {} as TravelFilter);
    }
  }

  /**
   * 폴백 코스 생성 (AI 실패시)
   */
  private createFallbackRoutes(places: Place[], filter: TravelFilter): RouteRecommendation[] {
    if (places.length === 0) return [];

    const routes: RouteRecommendation[] = [];
    
    // 코스 1: 인기 명소 위주
    const popularPlaces = places
      .filter(p => p.rating >= 4.0)
      .slice(0, 4);
    
    if (popularPlaces.length > 0) {
      routes.push({
        id: 'fallback_1',
        title: '인기 명소 투어',
        duration: '8시간',
        totalBudget: popularPlaces.reduce((sum, p) => sum + (p.entry_fee || 10000), 0),
        places: popularPlaces.map(p => ({
          name: p.name,
          type: p.category,
          duration: `${p.duration_hours}시간`,
          cost: p.entry_fee || 10000,
          description: p.description.slice(0, 50) + '...'
        })),
        highlights: popularPlaces.flatMap(p => p.tags?.slice(0, 2) || []).slice(0, 3),
        difficulty: 'easy'
      });
    }

    // 코스 2: 카페/맛집 위주
    const foodPlaces = places
      .filter(p => p.category === 'cafe' || p.category === 'restaurant')
      .slice(0, 4);

    if (foodPlaces.length > 0) {
      routes.push({
        id: 'fallback_2',
        title: '맛집 카페 투어',
        duration: '6시간',
        totalBudget: 45000,
        places: foodPlaces.map(p => ({
          name: p.name,
          type: p.category,
          duration: `${p.avg_stay_minutes || 120}분`,
          cost: 15000,
          description: p.description.slice(0, 50) + '...'
        })),
        highlights: ['맛집', '카페', '힐링'],
        difficulty: 'easy'
      });
    }

    return routes;
  }

  // 유틸리티 메서드들
  private mapRegionToCode(region: string): string {
    const regionMap: { [key: string]: string } = {
      'seoul': 'SEL',
      'sudogwon': 'SDG', 
      'chungcheong': 'CCD',
      'gangwon': 'GWD',
      'gyeongsang': 'GSD',
      'jeolla': 'JLD',
      'jeju': 'JJD',
      '서울': 'SEL',
      '수도권': 'SDG',
      '충청도': 'CCD',
      '강원도': 'GWD',
      '경상도': 'GSD',
      '전라도': 'JLD',
      '제주도': 'JJD'
    };
    return regionMap[region] || region;
  }

  private mapBudgetRange(budget: string): string | null {
    if (budget.includes('5만원 이하')) return 'budget_low';
    if (budget.includes('5-10만원')) return 'budget_medium';
    if (budget.includes('10-20만원')) return 'budget_high';
    return null;
  }

  private mapCompanionType(companions: string): string {
    const companionMap: { [key: string]: string } = {
      '혼자서': 'solo',
      '연인과': 'couple',
      '친구들과': 'friends',
      '가족과': 'family'
    };
    return companionMap[companions] || 'solo';
  }

  private getInterestKeywords(interest: string): string[] {
    const interestMap: { [key: string]: string[] } = {
      '자연': ['자연', '산', '바다', '공원', '정원', '숲', '해변', '계곡'],
      '문화': ['박물관', '미술관', '궁궐', '사찰', '유적', '전통', '역사'],
      '맛집': ['음식', '맛집', '식당', '요리', '전통음식', '로컬푸드'],
      '카페': ['카페', '커피', '디저트', '베이커리', '차'],
      '포토스팟': ['사진', '뷰', '전망', '인스타', '포토존', '경치'],
      '액티비티': ['체험', '활동', '스포츠', '레저', '어드벤처'],
      '힐링': ['휴식', '힐링', '여유', '평화', '조용한'],
      '쇼핑': ['쇼핑', '시장', '상가', '기념품', '쇼핑몰', '직매장', '상점']
    };
    return interestMap[interest] || [interest];
  }
}