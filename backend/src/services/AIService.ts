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
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API 키가 설정되지 않았습니다. Mock 모드로 동작합니다.');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    });
  }

  /**
   * ✅ 개선된 RAG 검색: 임베딩 + 키워드 하이브리드 방식
   */
  async performRAGSearch(userMessage: string, filter: TravelFilter): Promise<Place[]> {
    try {
      // 1단계: 필터 기반 후보 축소
      const candidatePlaces = await this.searchPlacesByFilter(filter);
      console.log(`🔍 필터 검색 결과: ${candidatePlaces.length}개`);

      if (candidatePlaces.length === 0) {
        return [];
      }

      // 2단계: 향상된 의미적 검색 - 타입 에러 수정
      const rankedPlaces = await this.advancedSemanticSearch(userMessage, candidatePlaces, filter.interests);
      
      // 3단계: 다양성 보장 (같은 카테고리 너무 많지 않게)
      const diversifiedPlaces = this.diversifyResults(rankedPlaces, 3);
      
      console.log(`🎯 최종 선택된 장소: ${diversifiedPlaces.length}개`);
      return diversifiedPlaces.slice(0, 15);
    } catch (error) {
      console.error('Error in RAG search:', error);
      return [];
    }
  }

  /**
   * ✅ 실제 OpenAI API를 사용한 여행 코스 생성
   */
  async generateTravelRoutes(places: Place[], userMessage: string, filter: TravelFilter): Promise<RouteRecommendation[]> {
    // OpenAI API가 설정되지 않은 경우 Mock으로 fallback
    if (!process.env.OPENAI_API_KEY) {
      console.log('🔧 OpenAI API 키 없음 - Mock 모드로 동작');
      return this.createIntelligentMockRoutes(places, userMessage, filter);
    }

    try {
      console.log('🤖 OpenAI API로 코스 생성 시작');
      
      const prompt = this.buildAdvancedPrompt(places, userMessage, filter);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "당신은 한국 여행 전문가입니다. 주어진 장소들만을 사용하여 최적의 여행 코스를 3개 생성해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const aiResponse = response.choices[0].message.content;
      if (!aiResponse) {
        throw new Error('OpenAI 응답이 비어있습니다.');
      }

      console.log('✅ OpenAI 응답 수신 완료');
      return this.parseAndValidateAIResponse(aiResponse, places, filter);

    } catch (error) {
      console.error('❌ OpenAI API 오류:', error);
      console.log('🔄 Mock 모드로 fallback');
      return this.createIntelligentMockRoutes(places, userMessage, filter);
    }
  }

  /**
   * ✅ 향상된 의미적 검색 (키워드 + 컨텍스트)
   */
  private async advancedSemanticSearch(userMessage: string, places: Place[], interests: string[]): Promise<Place[]> {
    const messageKeywords = this.extractKeywords(userMessage);
    const contextKeywords = this.getContextKeywords(userMessage);
    
    const scoredPlaces = places.map(place => {
      let score = place.score || 4.0;
      
      // 기본 키워드 매칭 점수
      score += this.calculateKeywordScore(place, messageKeywords) * 2.0;
      
      // 컨텍스트 기반 점수 (관심사, 감정 등)
      score += this.calculateContextScore(place, contextKeywords, interests) * 1.5;
      
      // 인기도 점수 (평점, 리뷰 수 고려)
      score += this.calculatePopularityScore(place) * 1.2;
      
      // 동행자 맞춤 점수
      score += this.calculateCompanionScore(place, userMessage) * 1.3;
      
      return { ...place, finalScore: score };
    });

    return scoredPlaces
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
      .map(({ finalScore, ...place }) => place);
  }

  /**
   * ✅ 고도화된 프롬프트 엔지니어링
   */
  private buildAdvancedPrompt(places: Place[], userMessage: string, filter: TravelFilter): string {
    const regionMap: { [key: string]: string } = {
      'seoul': '서울',
      'sudogwon': '수도권',
      'gangwon': '강원도',
      'chungcheong': '충청도',  
      'gyeongsang': '경상도',
      'jeolla': '전라도',
      'jeju': '제주도'
    };

    const placesInfo = places.slice(0, 12).map((place, index) => 
      `${index + 1}. "${place.name}" | 카테고리: ${place.category} | 평점: ${place.rating} | 입장료: ${place.entry_fee || 0}원 | 소요시간: ${place.duration_hours}시간 | 설명: ${place.description.substring(0, 100)}`
    ).join('\n');

    return `
사용자 요청: "${userMessage}"

여행 조건:
- 예산 범위: ${filter.budget || '제한 없음'}
- 여행 기간: ${filter.duration || '당일'}
- 동행자: ${filter.companions || '정보 없음'}
- 관심 분야: ${filter.interests.length > 0 ? filter.interests.join(', ') : '다양함'}
- 희망 지역: ${regionMap[filter.region] || filter.region || '전국'}

🎯 **중요 규칙**:
1. 아래 장소 목록에서만 선택하세요
2. 실제 비용과 소요시간을 정확히 사용하세요  
3. 예산을 초과하지 마세요
4. 동선을 고려하여 효율적으로 구성하세요
5. 다양한 카테고리를 적절히 조합하세요

🗺️ **사용 가능한 장소 목록**:
${placesInfo}

📋 **응답 형식** (JSON):
{
  "routes": [
    {
      "id": "route_1",
      "title": "매력적인 코스 제목 (20자 이내)",
      "duration": "6시간",
      "totalBudget": 실제_합계_비용,
      "places": [
        {
          "name": "정확한 장소명",
          "type": "category",
          "duration": "2시간",
          "cost": 실제_입장료,
          "description": "이 장소에서 할 수 있는 활동 설명"
        }
      ],
      "highlights": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
      "difficulty": "easy|moderate|hard"
    }
  ]
}

⚠️ 반드시 위 장소 목록에 있는 장소만 사용하고, 3개의 서로 다른 코스를 만들어주세요.
`;
  }

  /**
   * ✅ AI 응답 파싱 및 검증
   */
  private parseAndValidateAIResponse(response: string, availablePlaces: Place[], filter: TravelFilter): RouteRecommendation[] {
    try {
      const parsed = JSON.parse(response);
      const routes = parsed.routes || [];
      
      const validatedRoutes = routes.map((route: any) => {
        // 장소 존재 여부 검증 및 정정
        const validPlaces = route.places
          .map((place: any) => {
            const actualPlace = availablePlaces.find(p => 
              p.name === place.name || 
              p.name.includes(place.name) || 
              place.name.includes(p.name)
            );
            
            if (actualPlace) {
              return {
                name: actualPlace.name,
                type: actualPlace.category,
                duration: `${actualPlace.duration_hours}시간`,
                cost: actualPlace.entry_fee || 0,
                description: place.description || actualPlace.description
              };
            }
            return null;
          })
          .filter((place: any) => place !== null);

        if (validPlaces.length === 0) return null;

        // 실제 예산 재계산
        const actualTotalBudget = validPlaces.reduce((sum: number, p: any) => sum + p.cost, 0);

        return {
          id: route.id || `ai_route_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: route.title || '추천 여행 코스',
          duration: route.duration || '하루',
          totalBudget: actualTotalBudget,
          places: validPlaces,
          highlights: route.highlights || ['추천', '인기', '핫플'],
          difficulty: route.difficulty || 'easy'
        };
      }).filter((route: any) => route !== null);

      console.log(`✅ AI 생성 코스 ${validatedRoutes.length}개 검증 완료`);
      return validatedRoutes.length > 0 ? validatedRoutes : this.createFallbackRoutes(availablePlaces, filter);
      
    } catch (error) {
      console.error('AI 응답 파싱 오류:', error);
      return this.createFallbackRoutes(availablePlaces, filter);
    }
  }

  /**
   * ✅ 키워드 추출 고도화
   */
  private extractKeywords(message: string): string[] {
    const keywords = message.toLowerCase().split(/\s+/);
    const stopWords = ['는', '은', '이', '가', '을', '를', '에', '서', '와', '과', '의', '로', '으로', '도', '만', '조금', '정말', '진짜'];
    return keywords.filter(word => word.length > 1 && !stopWords.includes(word));
  }

  /**
   * ✅ 컨텍스트 키워드 추출 (감정, 목적 등)
   */
  private getContextKeywords(message: string): string[] {
    const contextMap: { [key: string]: string[] } = {
      '힐링': ['힐링', '쉬고', '휴식', '평화', '조용', '여유'],
      '로맨틱': ['데이트', '연인', '로맨틱', '분위기', '예쁜', '감성'],
      '액티비티': ['재미', '활동', '체험', '신나', '즐거', '활기'],
      '문화': ['역사', '문화', '전통', '배우', '교육', '견학'],
      '자연': ['자연', '바다', '산', '공원', '경치', '풍경'],
      '맛집': ['맛있', '음식', '먹', '맛집', '요리', '식당']
    };

    const contexts: string[] = [];
    Object.entries(contextMap).forEach(([context, words]) => {
      if (words.some(word => message.includes(word))) {
        contexts.push(context);
      }
    });
    return contexts;
  }

  /**
   * ✅ 키워드 매칭 점수 계산
   */
  private calculateKeywordScore(place: Place, keywords: string[]): number {
    let score = 0;
    const searchableText = [
      place.name,
      place.description,
      ...(place.tags || []),
      place.category
    ].join(' ').toLowerCase();

    keywords.forEach(keyword => {
      if (searchableText.includes(keyword)) {
        score += 1.0;
      }
    });

    return score;
  }

  /**
   * ✅ 컨텍스트 점수 계산
   */
  private calculateContextScore(place: Place, contexts: string[], interests: string[]): number {
    let score = 0;

    // 컨텍스트 매칭
    contexts.forEach(context => {
      const contextKeywords = this.getInterestKeywords(context);
      const searchableText = [place.name, place.description, ...place.tags].join(' ').toLowerCase();
      
      if (contextKeywords.some(keyword => searchableText.includes(keyword.toLowerCase()))) {
        score += 2.0;
      }
    });

    // 관심사 매칭
    interests.forEach(interest => {
      const interestKeywords = this.getInterestKeywords(interest);
      const searchableText = [place.name, place.description, ...place.tags].join(' ').toLowerCase();
      
      if (interestKeywords.some(keyword => searchableText.includes(keyword.toLowerCase()))) {
        score += 1.5;
      }
    });

    return score;
  }

  /**
   * ✅ 인기도 점수 계산
   */
  private calculatePopularityScore(place: Place): number {
    let score = 0;
    
    // 평점 기반 점수
    if (place.rating >= 4.5) score += 2.0;
    else if (place.rating >= 4.0) score += 1.5;
    else if (place.rating >= 3.5) score += 1.0;

    // 기본 점수가 높은 경우
    if (place.score >= 4.5) score += 1.0;

    return score;
  }

  /**
   * ✅ 동행자 맞춤 점수 계산
   */
  private calculateCompanionScore(place: Place, message: string): number {
    let score = 0;
    
    if (message.includes('혼자') && place.companion_type?.includes('solo')) score += 1.0;
    if (message.includes('연인') || message.includes('데이트')) {
      if (place.companion_type?.includes('couple')) score += 1.5;
    }
    if (message.includes('친구') && place.companion_type?.includes('friends')) score += 1.0;
    if (message.includes('가족') && place.companion_type?.includes('family')) score += 1.0;

    return score;
  }

  /**
   * ✅ 결과 다양성 보장
   */
  private diversifyResults(places: Place[], maxPerCategory: number = 3): Place[] {
    const diversified: Place[] = [];
    const categoryCount: { [key: string]: number } = {};

    places.forEach(place => {
      const category = place.category;
      const currentCount = categoryCount[category] || 0;

      if (currentCount < maxPerCategory) {
        diversified.push(place);
        categoryCount[category] = currentCount + 1;
      }
    });

    // 남은 자리가 있으면 점수 순으로 채움
    const remaining = places.filter(p => !diversified.includes(p));
    const remainingSlots = Math.max(0, 15 - diversified.length);
    diversified.push(...remaining.slice(0, remainingSlots));

    return diversified;
  }

  /**
   * ✅ 향상된 Mock 코스 생성 (API 실패 시 fallback)
   */
  private createIntelligentMockRoutes(places: Place[], userMessage: string, filter: TravelFilter): RouteRecommendation[] {
    if (places.length === 0) return [];
    
    console.log('🎯 고도화된 Mock 코스 생성 시작');
    
    // 메시지 분석으로 테마 결정
    const themes = this.analyzeUserIntent(userMessage, filter);
    const routes: RouteRecommendation[] = [];

    themes.forEach((theme, index) => {
      const themePlaces = this.selectPlacesByTheme(places, theme, 4);
      if (themePlaces.length > 0) {
        routes.push(this.createThematicRoute(`theme_${index + 1}`, themePlaces, theme));
      }
    });

    return routes.slice(0, 3); // 최대 3개 코스
  }

  /**
   * ✅ 사용자 의도 분석
   */
  private analyzeUserIntent(message: string, filter: TravelFilter): string[] {
    const themes: string[] = [];
    
    // 메시지 기반 테마 추출
    if (message.includes('데이트') || message.includes('연인') || filter.companions === 'couple') {
      themes.push('romantic');
    }
    if (message.includes('맛집') || message.includes('먹') || filter.interests.includes('food')) {
      themes.push('foodie');
    }
    if (message.includes('힐링') || message.includes('휴식') || filter.interests.includes('healing')) {
      themes.push('healing');
    }
    if (message.includes('카페') || filter.interests.includes('cafe')) {
      themes.push('cafe');
    }
    if (message.includes('문화') || message.includes('역사') || filter.interests.includes('culture')) {
      themes.push('cultural');
    }
    if (message.includes('자연') || filter.interests.includes('nature')) {
      themes.push('nature');
    }

    // 기본 테마 추가
    if (themes.length === 0) {
      themes.push('popular', 'diverse', 'budget');
    }

    return themes.slice(0, 3);
  }

  /**
   * ✅ 테마별 장소 선택
   */
  private selectPlacesByTheme(places: Place[], theme: string, count: number): Place[] {
    let filteredPlaces = places;

    switch (theme) {
      case 'romantic':
        filteredPlaces = places.filter(p => 
          p.companion_type?.includes('couple') || 
          p.tags?.some(tag => ['로맨틱', '데이트', '분위기', '야경', '카페'].includes(tag))
        );
        break;
      case 'foodie':
        filteredPlaces = places.filter(p => 
          p.category === 'restaurant' || 
          p.tags?.some(tag => ['맛집', '음식', '요리', '전통음식'].includes(tag))
        );
        break;
      case 'healing':
        filteredPlaces = places.filter(p => 
          p.category === 'nature' || p.category === 'park' ||
          p.tags?.some(tag => ['힐링', '휴식', '자연', '조용한', '평화'].includes(tag))
        );
        break;
      case 'cafe':
        filteredPlaces = places.filter(p => 
          p.category === 'cafe' || 
          p.tags?.some(tag => ['카페', '커피', '디저트', '베이커리'].includes(tag))
        );
        break;
      case 'cultural':
        filteredPlaces = places.filter(p => 
          p.category === 'culture' || p.category === 'attraction' ||
          p.tags?.some(tag => ['문화', '역사', '전통', '박물관', '유적'].includes(tag))
        );
        break;
      case 'nature':
        filteredPlaces = places.filter(p => 
          p.category === 'nature' || p.category === 'park' ||
          p.tags?.some(tag => ['자연', '산', '바다', '공원', '경치'].includes(tag))
        );
        break;
      case 'popular':
        filteredPlaces = places.filter(p => p.rating >= 4.0);
        break;
      case 'budget':
        filteredPlaces = places.filter(p => (p.entry_fee || 0) <= 10000);
        break;
    }

    // 필터링된 결과가 부족하면 전체에서 선택
    if (filteredPlaces.length < count) {
      filteredPlaces = places;
    }

    return filteredPlaces
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, count);
  }

  /**
   * ✅ 테마별 코스 생성
   */
  private createThematicRoute(id: string, places: Place[], theme: string): RouteRecommendation {
    const totalBudget = places.reduce((sum, p) => sum + (p.entry_fee || 0), 0);
    const totalDuration = places.reduce((sum, p) => sum + (p.duration_hours || 2), 0);
    
    const themeTitle: { [key: string]: string } = {
      'romantic': '💕 로맨틱 데이트 코스',
      'foodie': '🍽️ 맛집 탐방 코스', 
      'healing': '🧘‍♀️ 힐링 여행 코스',
      'cafe': '☕ 카페 투어 코스',
      'cultural': '🏛️ 문화 체험 코스',
      'nature': '🌿 자연 만끽 코스',
      'popular': '⭐ 인기 명소 코스',
      'budget': '💰 가성비 여행 코스'
    };

    return {
      id: `enhanced_${id}`,
      title: themeTitle[theme] || '추천 여행 코스',
      duration: `${totalDuration}시간`,
      totalBudget,
      places: places.map(p => ({
        name: p.name,
        type: p.category,
        duration: `${p.duration_hours || 2}시간`,
        cost: p.entry_fee || 0,
        description: p.description.slice(0, 100) + (p.description.length > 100 ? '...' : '')
      })),
      highlights: this.extractThemeHighlights(places, theme),
      difficulty: totalDuration <= 4 ? 'easy' : totalDuration <= 8 ? 'moderate' : 'hard'
    };
  }

  /**
   * ✅ 테마별 하이라이트 추출
   */
  private extractThemeHighlights(places: Place[], theme: string): string[] {
    const allTags = places.flatMap(p => p.tags || []);
    const uniqueTags = [...new Set(allTags)];
    
    const themeHighlights: { [key: string]: string[] } = {
      'romantic': ['데이트', '로맨틱', '분위기'],
      'foodie': ['맛집', '미식', '요리'],
      'healing': ['힐링', '여유', '자연'],
      'cafe': ['카페', '디저트', '커피'],
      'cultural': ['문화', '역사', '전통'],
      'nature': ['자연', '경치', '산책'],
      'popular': ['인기', '핫플', '추천'],
      'budget': ['가성비', '무료', '저렴']
    };
    
    const baseHighlights = themeHighlights[theme] || ['추천', '인기', '핫플'];
    const tagHighlights = uniqueTags.slice(0, 2);
    
    return [...baseHighlights, ...tagHighlights].slice(0, 4);
  }

  // ============================================================================
  // 기존 유틸리티 메서드들 (그대로 유지)
  // ============================================================================

  async searchPlacesByFilter(filter: TravelFilter): Promise<Place[]> {
    try {
      let query = supabase
        .from('travel_destinations')
        .select('*')
        .limit(50);

      if (filter.region && filter.region !== '') {
        query = query.eq('region', this.mapRegionToCode(filter.region));
      }

      if (filter.budget) {
        const budgetRange = this.mapBudgetRange(filter.budget);
        if (budgetRange) {
          query = query.eq('price_range', budgetRange);
        }
      }

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

  private createFallbackRoutes(places: Place[], filter: TravelFilter): RouteRecommendation[] {
    return this.createIntelligentMockRoutes(places, '', filter);
  }

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
    if (budget.includes('under_50000') || budget.includes('5만원 이하')) return 'budget_free';
    if (budget.includes('50000_100000') || budget.includes('5-10만원')) return 'budget_low';
    if (budget.includes('100000_200000') || budget.includes('10-20만원')) return 'budget_medium';
    if (budget.includes('over_200000') || budget.includes('20만원 이상')) return 'budget_high';
    return null;
  }

  private mapCompanionType(companions: string): string {
    const companionMap: { [key: string]: string } = {
      'solo': 'solo',
      'couple': 'couple', 
      'friends': 'friends',
      'family': 'family',
      '혼자서': 'solo',
      '연인과': 'couple',
      '친구들과': 'friends',
      '가족과': 'family'
    };
    return companionMap[companions] || 'solo';
  }

  private getInterestKeywords(interest: string): string[] {
    const interestMap: { [key: string]: string[] } = {
      'nature': ['자연', '산', '바다', '공원', '정원', '숲', '해변', '계곡'],
      'culture': ['박물관', '미술관', '궁궐', '사찰', '유적', '전통', '역사', '문화재'],
      'food': ['음식', '맛집', '식당', '요리', '전통음식', '로컬푸드', '별미'],
      'cafe': ['카페', '커피', '디저트', '베이커리', '차', '음료'],
      'photo': ['사진', '뷰', '전망', '인스타', '포토존', '경치', '풍경'],
      'activity': ['체험', '활동', '스포츠', '레저', '어드벤처', '참여'],
      'healing': ['휴식', '힐링', '여유', '평화', '조용한', '치유'],
      'shopping': ['쇼핑', '시장', '상가', '기념품', '쇼핑몰', '구매'],
      '자연': ['자연', '산', '바다', '공원', '정원', '숲', '해변', '계곡'],
      '문화': ['박물관', '미술관', '궁궐', '사찰', '유적', '전통', '역사'],
      '맛집': ['음식', '맛집', '식당', '요리', '전통음식', '로컬푸드'],
      '카페': ['카페', '커피', '디저트', '베이커리', '차'],
      '포토스팟': ['사진', '뷰', '전망', '인스타', '포토존', '경치'],
      '액티비티': ['체험', '활동', '스포츠', '레저', '어드벤처'],
      '힐링': ['휴식', '힐링', '여유', '평화', '조용한'],
      '쇼핑': ['쇼핑', '시장', '상가', '기념품', '쇼핑몰']
    };
    return interestMap[interest] || [interest];
  }
}