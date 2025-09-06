import { Request, Response } from 'express';
import { supabase, TravelPackage, ItineraryItem } from '../config/supabase';

export class TravelController {
  // AI 기반 맞춤 코스 추천
  static async getRecommendations(req: Request, res: Response): Promise<Response> {
    try {
      const { budget, interests, duration, companions } = req.body;
      
      // 예산 카테고리 결정
      const budgetCategory = TravelController.getBudgetCategory(budget);
      
      // 여행 기간을 일수로 변환
      const durationDays = TravelController.getDurationDays(duration);
      
      // 동반자 타입 매핑
      const companionType = TravelController.mapCompanionType(companions);

      // 기본 패키지 검색
      let query = supabase
        .from('travel_packages')
        .select(`
          *,
          itinerary_items(*),
          package_keywords(
            hot_keywords(*)
          )
        `)
        .eq('is_active', true)
        .eq('duration_days', durationDays)
        .eq('companion_type', companionType)
        .lte('min_budget', budget)
        .gte('max_budget', budget);

      if (budgetCategory) {
        query = query.eq('budget_category', budgetCategory);
      }

      const { data: packages, error } = await query
        .order('popularity_score', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      // 관심사 기반 필터링 (키워드 매칭)
      const filteredPackages = packages?.filter((pkg) => {
        if (!interests || interests.length === 0) return true;

        const packageKeywords: string[] =
          (pkg.package_keywords ?? []).map(
            (pk: any) => String(pk.hot_keywords.keyword_name).toLowerCase()
          );

        return interests.some((interest: string) =>
          packageKeywords.some((keyword: string) =>
            keyword.includes(interest.toLowerCase())
          )
        );
      }) ?? [];

      // 응답 데이터 포맷팅
      const recommendations = filteredPackages.map((pkg) => ({
        id: pkg.id,
        title: pkg.title,
        budget: pkg.max_budget,
        duration: TravelController.formatDuration(pkg.duration_days),
        highlights: pkg.package_keywords?.map((pk: any) => pk.hot_keywords.keyword_name) ?? [],
        estimatedCost: {
          transportation: Math.floor(pkg.max_budget * 0.3),
          accommodation: Math.floor(pkg.max_budget * 0.4),
          food: Math.floor(pkg.max_budget * 0.3),
        },
        region: pkg.region_code,
        theme: pkg.theme,
        rating: pkg.average_rating,
        thumbnail: pkg.thumbnail_url,
      }));

      return res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get recommendations',
      });
    }
  }

  // 지역별 로컬 체험 프로그램 조회
  static async getLocalExperiences(req: Request, res: Response): Promise<Response> {
    try {
      const { region } = req.params;
      
      const { data, error } = await supabase
        .from('travel_packages')
        .select(`
          id,
          title,
          region_code,
          min_budget,
          duration_days,
          average_rating,
          theme
        `)
        .eq('region_code', region.toUpperCase())
        .eq('is_active', true)
        .eq('theme', 'ACTIVITY')
        .order('average_rating', { ascending: false });

      if (error) {
        throw error;
      }

      const experiences = data?.map((item) => ({
        id: item.id,
        name: item.title,
        region: item.region_code,
        price: item.min_budget,
        duration: TravelController.formatDuration(item.duration_days),
        rating: item.average_rating || 0,
        isYouthOwned: true, // 청년 사업자 여부는 별도 로직 필요
      })) ?? [];

      return res.json({
        success: true,
        data: experiences,
      });
    } catch (error) {
      console.error('Error in getLocalExperiences:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get local experiences',
      });
    }
  }

  // 여행지 상세 정보
  static async getDestinationDetail(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('travel_packages')
        .select(`
          *,
          itinerary_items(*),
          package_keywords(
            hot_keywords(*)
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Destination not found',
        });
      }

      const detailInfo = {
        id: data.id,
        name: data.title,
        description: data.description,
        photos: [], // 별도 사진 테이블에서 가져와야 함
        crowdLevel: '보통', // 별도 로직 필요
        bestPhotoSpots: data.package_keywords?.map((pk: any) => pk.hot_keywords.keyword_name) ?? [],
        localTips: data.itinerary_items?.map((item: any) => item.tips).filter(Boolean) ?? [],
        itinerary: data.itinerary_items ?? [],
        region: data.region_code,
        budget: {
          min: data.min_budget,
          max: data.max_budget,
          category: data.budget_category,
        },
        duration: TravelController.formatDuration(data.duration_days),
        theme: data.theme,
        rating: data.average_rating,
        reviews: data.total_reviews,
      };

      return res.json({
        success: true,
        data: detailInfo,
      });
    } catch (error) {
      console.error('Error in getDestinationDetail:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get destination detail',
      });
    }
  }

  // 헬퍼 메서드들
  private static getBudgetCategory(budget: number): string {
    if (budget <= 30000) return 'ULTRA_SAVE';
    if (budget <= 70000) return 'VALUE';
    if (budget <= 150000) return 'MODERATE';
    if (budget <= 300000) return 'COMFORTABLE';
    return 'LUXURY';
  }

  private static getDurationDays(duration: string): number {
    if (duration.includes('당일')) return 0;
    if (duration.includes('1박')) return 1;
    if (duration.includes('2박')) return 2;
    if (duration.includes('3박')) return 3;
    return 1; // 기본값
  }

  private static mapCompanionType(companions: string): string {
    const mapping: { [key: string]: string } = {
      '혼자': 'SOLO',
      '연인': 'COUPLE',
      '친구': 'FRIENDS',
      '가족': 'FAMILY',
    };
    return mapping[companions] || 'SOLO';
  }

  private static formatDuration(days: number): string {
    if (days === 0) return '당일';
    return `${days}박 ${days + 1}일`;
  }
}
