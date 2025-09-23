// backend/src/utils/dataOptimization.ts
export interface Destination {
    name: string;
    region: string;
    category: string;
    description: string;
    tags: string[];
    companion_type: string[];
    rating: number;
    score: number;
    price_range: string;
    duration_hours: number;
  }
  
  export interface UserFilters {
    region?: string;
    budget?: string;
    companions?: string;
    interests?: string[];
  }
  
  // 태그 정규화 매핑
  const TAG_MAPPING: Record<string, string[]> = {
    '사진': ['포토스팟', '인스타', '사진촬영', 'SNS', '인증샷'],
    '힐링': ['휴식', '여유', '평화', '치유', '쉼', '명상'],
    '맛집': ['음식', '요리', '미식', '식당', '먹거리'],
    '자연': ['산', '바다', '공원', '자연경관', '숲', '해변'],
    '문화': ['역사', '전통', '박물관', '유적', '문화재'],
    '액티비티': ['체험', '활동', '레저', '스포츠', '어드벤처'],
    '야경': ['밤', '조명', '불빛', '야간', '석양'],
    '쇼핑': ['시장', '상가', '몰', '기념품', '구매'],
    '카페': ['커피', '디저트', '베이커리', '차', '음료'],
    '로맨틱': ['데이트', '연인', '커플', '사랑', '낭만적']
  };
  
  // 검색 가중치 설정
  const SEARCH_WEIGHTS = {
    exactNameMatch: 5.0,
    partialNameMatch: 3.0,
    descriptionMatch: 2.0,
    tagMatch: 2.5,
    categoryMatch: 1.5,
    ratingBonus: 1.0,
    regionBonus: 1.0,
    interestBonus: 3.0
  } as const;
  
  export class DataOptimizer {
    
    /**
     * 태그 정규화 - 유사한 태그들을 대표 태그로 통합
     */
    static normalizeTagsAndCategories(destinations: Destination[]): Destination[] {
      return destinations.map(dest => {
        let normalizedTags = [...dest.tags];
        
        Object.entries(TAG_MAPPING).forEach(([mainTag, variants]) => {
          const hasVariant = variants.some(variant => 
            dest.tags.some(tag => tag.toLowerCase().includes(variant.toLowerCase()))
          );
          
          if (hasVariant && !normalizedTags.includes(mainTag)) {
            normalizedTags.push(mainTag);
          }
        });
        
        return {
          ...dest,
          tags: [...new Set(normalizedTags)] // 중복 제거
        };
      });
    }
  
    /**
     * 검색 가중치 계산
     */
    static calculateSearchWeights(
      destination: Destination, 
      userQuery: string, 
      userFilters: UserFilters
    ): number {
      let score = destination.score || 4.0;
      
      const queryWords = userQuery.toLowerCase().split(/\s+/).filter(word => word.length > 1);
      
      queryWords.forEach(word => {
        // 이름 매칭
        if (destination.name.toLowerCase() === word) {
          score += SEARCH_WEIGHTS.exactNameMatch;
        } else if (destination.name.toLowerCase().includes(word)) {
          score += SEARCH_WEIGHTS.partialNameMatch;
        }
        
        // 설명 매칭
        if (destination.description.toLowerCase().includes(word)) {
          score += SEARCH_WEIGHTS.descriptionMatch;
        }
        
        // 태그 매칭
        destination.tags.forEach(tag => {
          if (tag.toLowerCase().includes(word)) {
            score += SEARCH_WEIGHTS.tagMatch;
          }
        });
        
        // 카테고리 매칭
        if (destination.category.toLowerCase().includes(word)) {
          score += SEARCH_WEIGHTS.categoryMatch;
        }
      });
      
      // 평점 보너스 (4.0 이상일 때)
      if (destination.rating >= 4.0) {
        score += SEARCH_WEIGHTS.ratingBonus * (destination.rating - 3.0);
      }
      
      // 지역 일치 보너스
      if (userFilters.region && destination.region === userFilters.region) {
        score += SEARCH_WEIGHTS.regionBonus;
      }
      
      // 관심사 매칭 보너스
      if (userFilters.interests && userFilters.interests.length > 0) {
        userFilters.interests.forEach(interest => {
          const interestKeywords = this.getInterestKeywords(interest);
          interestKeywords.forEach(keyword => {
            const searchableText = [
              destination.name,
              destination.description,
              ...destination.tags
            ].join(' ').toLowerCase();
            
            if (searchableText.includes(keyword.toLowerCase())) {
              score += SEARCH_WEIGHTS.interestBonus;
            }
          });
        });
      }
      
      return score;
    }
  
    /**
     * 관심사별 키워드 매핑
     */
    private static getInterestKeywords(interest: string): string[] {
      const interestMap: Record<string, string[]> = {
        '자연': ['자연', '산', '바다', '공원', '정원', '숲', '해변', '계곡'],
        '문화': ['박물관', '미술관', '궁궐', '사찰', '유적', '전통', '역사', '문화재'],
        '맛집': ['음식', '맛집', '식당', '요리', '전통음식', '로컬푸드', '별미'],
        '카페': ['카페', '커피', '디저트', '베이커리', '차', '음료'],
        '포토스팟': ['사진', '뷰', '전망', '인스타', '포토존', '경치', '풍경'],
        '액티비티': ['체험', '활동', '스포츠', '레저', '어드벤처', '참여'],
        '힐링': ['휴식', '힐링', '여유', '평화', '조용한', '치유'],
        '쇼핑': ['쇼핑', '시장', '상가', '기념품', '쇼핑몰', '구매']
      };
      
      return interestMap[interest] || [interest];
    }
  
    /**
     * 데이터 검증
     */
    static validateDestinationData(destinations: Destination[]): string[] {
      const issues: string[] = [];
      
      destinations.forEach((dest, index) => {
        // 필수 필드 체크
        const requiredFields: (keyof Destination)[] = [
          'name', 'region', 'category', 'description'
        ];
        
        requiredFields.forEach(field => {
          const value = dest[field];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            issues.push(`행 ${index + 1}: ${field} 필드가 비어있음 (${dest.name})`);
          }
        });
        
        // 평점 범위 체크
        if (dest.rating < 0 || dest.rating > 5) {
          issues.push(`행 ${index + 1}: 평점 범위 오류 (${dest.rating}) - ${dest.name}`);
        }
        
        // 태그 다양성 체크
        if (!dest.tags || dest.tags.length === 0) {
          issues.push(`행 ${index + 1}: 태그가 없음 - ${dest.name}`);
        }
        
        // 동행자 타입 체크
        if (!dest.companion_type || dest.companion_type.length === 0) {
          issues.push(`행 ${index + 1}: 동행자 타입이 없음 - ${dest.name}`);
        }
      });
      
      return issues;
    }
  
    /**
     * 카테고리 균형 조정
     */
    static balanceCategories<T extends { category: string }>(
      places: T[], 
      maxPerCategory: number = 4
    ): T[] {
      const categories = ['attraction', 'cafe', 'restaurant', 'culture', 'shopping'];
      const balanced: T[] = [];
      
      categories.forEach(category => {
        const categoryPlaces = places
          .filter(p => p.category === category)
          .slice(0, maxPerCategory);
        balanced.push(...categoryPlaces);
      });
      
      // 남은 자리가 있으면 점수 순으로 추가
      const remaining = places.filter(p => !balanced.includes(p));
      const remainingSlots = Math.max(0, 15 - balanced.length);
      balanced.push(...remaining.slice(0, remainingSlots));
      
      return balanced;
    }
  
    /**
     * 지역/카테고리 분포 분석
     */
    static analyzeDataDistribution(destinations: Destination[]): {
      regionStats: Record<string, number>;
      categoryStats: Record<string, number>;
      recommendations: string[];
    } {
      const regionStats: Record<string, number> = {};
      const categoryStats: Record<string, number> = {};
      
      destinations.forEach(dest => {
        regionStats[dest.region] = (regionStats[dest.region] || 0) + 1;
        categoryStats[dest.category] = (categoryStats[dest.category] || 0) + 1;
      });
      
      const totalCount = destinations.length;
      const recommendations: string[] = [];
      
      // 권장 분포와 비교
      const idealRegionDistribution: Record<string, number> = {
        'SEL': 0.35,  // 서울 35%
        'SDG': 0.25,  // 수도권 25%
        'GWD': 0.1,   // 강원도 10%
        'CCD': 0.1,   // 충청도 10%
        'GSD': 0.1,   // 경상도 10%
        'JLD': 0.05,  // 전라도 5%
        'JJD': 0.05   // 제주도 5%
      };
      
      Object.entries(idealRegionDistribution).forEach(([region, idealRatio]) => {
        const actualCount = regionStats[region] || 0;
        const actualRatio = actualCount / totalCount;
        
        if (Math.abs(actualRatio - idealRatio) > 0.1) {
          recommendations.push(
            `${region} 지역: 현재 ${actualCount}개 (${(actualRatio * 100).toFixed(1)}%), ` +
            `권장 ${Math.round(totalCount * idealRatio)}개 (${(idealRatio * 100).toFixed(1)}%)`
          );
        }
      });
      
      return {
        regionStats,
        categoryStats,
        recommendations
      };
    }
  
    /**
     * 검색 결과 다양성 보장
     */
    static diversifyResults<T extends { category: string; region: string }>(
      results: T[],
      maxSimilar: number = 3
    ): T[] {
      const diversified: T[] = [];
      const categoryCount: Record<string, number> = {};
      const regionCount: Record<string, number> = {};
      
      for (const result of results) {
        const catCount = categoryCount[result.category] || 0;
        const regCount = regionCount[result.region] || 0;
        
        // 같은 카테고리나 지역이 너무 많지 않으면 추가
        if (catCount < maxSimilar && regCount < maxSimilar) {
          diversified.push(result);
          categoryCount[result.category] = catCount + 1;
          regionCount[result.region] = regCount + 1;
        }
        
        if (diversified.length >= 15) break;
      }
      
      return diversified;
    }
  }