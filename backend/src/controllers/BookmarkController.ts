// backend/src/controllers/BookmarkController.ts (수정된 버전)
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class BookmarkController {
  
  // ============================================================================
  // AI 루트 북마크 관련 메서드들
  // ============================================================================

  /**
   * AI 루트 북마크 저장
   */
  async saveAIRoute(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, routeData } = req.body;

      if (!sessionId || !routeData) {
        res.status(400).json({
          success: false,
          message: 'sessionId와 routeData가 필요합니다.'
        });
        return;
      }

      // routeData에서 필요한 정보 추출
      const {
        id: route_id,
        title,
        duration,
        totalBudget,
        places = [],
        highlights = [],
        difficulty
      } = routeData;

      // duration에서 시간 추출 (예: "6시간" -> 6)
      const duration_hours = this.extractHours(duration);
      
      // places에서 지역 코드 추출
      const region_codes = this.extractRegionCodes(places);

      const { data, error } = await supabase
        .from('ai_bookmarks')
        .insert({
          user_session_id: sessionId,
          route_id: route_id || `route_${Date.now()}`,
          title: title || '제목 없음',
          route_data: routeData,
          total_budget: totalBudget || 0,
          duration_hours,
          places_count: places.length,
          region_codes
        })
        .select()
        .single();

      if (error) {
        // 중복 저장 시도인 경우
        if (error.code === '23505') {
          res.status(409).json({
            success: false,
            message: '이미 저장된 코스입니다.'
          });
          return;
        }
        throw error;
      }

      res.json({
        success: true,
        data,
        message: 'AI 코스가 성공적으로 저장되었습니다.'
      });

    } catch (error) {
      console.error('AI 루트 저장 실패:', error);
      res.status(500).json({
        success: false,
        message: 'AI 코스 저장 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 사용자의 AI 루트 북마크 목록 조회
   */
  async getAIBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'sessionId가 필요합니다.'
        });
        return;
      }

      const { data, error } = await supabase
        .from('ai_bookmarks')
        .select('*')
        .eq('user_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: data || [],
        count: data?.length || 0
      });

    } catch (error) {
      console.error('AI 북마크 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: 'AI 북마크 조회 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * AI 루트 북마크 삭제
   */
  async deleteAIBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { bookmarkId } = req.params;
      const { sessionId } = req.body;

      if (!bookmarkId || !sessionId) {
        res.status(400).json({
          success: false,
          message: 'bookmarkId와 sessionId가 필요합니다.'
        });
        return;
      }

      const { error } = await supabase
        .from('ai_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_session_id', sessionId);

      if (error) throw error;

      res.json({
        success: true,
        message: 'AI 코스 북마크가 삭제되었습니다.'
      });

    } catch (error) {
      console.error('AI 북마크 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: 'AI 북마크 삭제 중 오류가 발생했습니다.'
      });
    }
  }

  // ============================================================================
  // 청년 혜택 북마크 관련 메서드들 (팀원 구현 후 활성화)
  // ============================================================================

  /**
   * 청년 혜택 북마크 저장
   */
  async saveBenefitBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, benefitData } = req.body;

      // TODO: 팀원이 청년 혜택 기능 완성 후 구현
      res.status(501).json({
        success: false,
        message: '청년 혜택 북마크 기능은 아직 구현되지 않았습니다.'
      });

    } catch (error) {
      console.error('혜택 북마크 저장 실패:', error);
      res.status(500).json({
        success: false,
        message: '혜택 북마크 저장 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 청년 혜택 북마크 목록 조회
   */
  async getBenefitBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      // TODO: 팀원이 청년 혜택 기능 완성 후 구현
      res.json({
        success: true,
        data: [],
        count: 0,
        message: '청년 혜택 북마크 기능은 개발 중입니다.'
      });

    } catch (error) {
      console.error('혜택 북마크 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '혜택 북마크 조회 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 청년 혜택 북마크 삭제
   */
  async deleteBenefitBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { bookmarkId } = req.params;
      const { sessionId } = req.body;

      // TODO: 팀원이 청년 혜택 기능 완성 후 구현
      res.status(501).json({
        success: false,
        message: '청년 혜택 북마크 삭제 기능은 아직 구현되지 않았습니다.'
      });

    } catch (error) {
      console.error('혜택 북마크 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: '혜택 북마크 삭제 중 오류가 발생했습니다.'
      });
    }
  }

  // ============================================================================
  // 지도 장소 북마크 관련 메서드들 (팀원 구현 후 활성화)
  // ============================================================================

  /**
   * 지도 장소 북마크 저장
   */
  async saveMapPlaceBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, placeData } = req.body;

      // TODO: 팀원이 지도 기능 완성 후 구현
      res.status(501).json({
        success: false,
        message: '지도 장소 북마크 기능은 아직 구현되지 않았습니다.'
      });

    } catch (error) {
      console.error('지도 장소 북마크 저장 실패:', error);
      res.status(500).json({
        success: false,
        message: '지도 장소 북마크 저장 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 지도 장소 북마크 목록 조회
   */
  async getMapPlaceBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      // TODO: 팀원이 지도 기능 완성 후 구현
      res.json({
        success: true,
        data: [],
        count: 0,
        message: '지도 장소 북마크 기능은 개발 중입니다.'
      });

    } catch (error) {
      console.error('지도 장소 북마크 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '지도 장소 북마크 조회 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 지도 장소 북마크 삭제
   */
  async deleteMapPlaceBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { bookmarkId } = req.params;
      const { sessionId } = req.body;

      // TODO: 팀원이 지도 기능 완성 후 구현
      res.status(501).json({
        success: false,
        message: '지도 장소 북마크 삭제 기능은 아직 구현되지 않았습니다.'
      });

    } catch (error) {
      console.error('지도 장소 북마크 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: '지도 장소 북마크 삭제 중 오류가 발생했습니다.'
      });
    }
  }

  // ============================================================================
  // 통합 북마크 통계 메서드
  // ============================================================================

  /**
   * 사용자 북마크 통계 조회
   */
  async getBookmarkSummary(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'sessionId가 필요합니다.'
        });
        return;
      }

      // AI 루트 북마크 통계
      const { data: aiBookmarks, error: aiError } = await supabase
        .from('ai_bookmarks')
        .select('total_budget, places_count, region_codes')
        .eq('user_session_id', sessionId);

      if (aiError) throw aiError;

      // 통계 계산
      const totalAIBookmarks = aiBookmarks?.length || 0;
      const totalBudget = aiBookmarks?.reduce((sum, bookmark) => sum + (bookmark.total_budget || 0), 0) || 0;
      const totalPlaces = aiBookmarks?.reduce((sum, bookmark) => sum + (bookmark.places_count || 0), 0) || 0;

      // 가장 인기 있는 지역 찾기
      const regionCounts: { [key: string]: number } = {};
      aiBookmarks?.forEach(bookmark => {
        bookmark.region_codes?.forEach((region: string) => {
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        });
      });

      const mostLikedRegion = Object.entries(regionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      // TODO: 팀원들이 다른 기능 완성하면 해당 북마크 수도 추가
      const totalBenefitBookmarks = 0; // 청년 혜택 북마크 수
      const totalMapPlaceBookmarks = 0; // 지도 장소 북마크 수

      const summary = {
        totalBookmarks: totalAIBookmarks + totalBenefitBookmarks + totalMapPlaceBookmarks,
        totalBudget,
        totalPlaces,
        mostLikedRegion,
        breakdown: {
          aiRoutes: totalAIBookmarks,
          benefits: totalBenefitBookmarks,
          mapPlaces: totalMapPlaceBookmarks
        },
        averageBudgetPerRoute: totalAIBookmarks > 0 ? Math.round(totalBudget / totalAIBookmarks) : 0
      };

      res.json({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('북마크 통계 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '북마크 통계 조회 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 모든 북마크 삭제 (사용자 계정 삭제 시 사용)
   */
  async deleteAllBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'sessionId가 필요합니다.'
        });
        return;
      }

      // AI 루트 북마크 삭제
      const { error: aiError } = await supabase
        .from('ai_bookmarks')
        .delete()
        .eq('user_session_id', sessionId);

      if (aiError) throw aiError;

      // TODO: 다른 북마크 테이블들도 추가로 삭제
      // 예: benefit_bookmarks, map_place_bookmarks 등

      res.json({
        success: true,
        message: '모든 북마크가 삭제되었습니다.'
      });

    } catch (error) {
      console.error('전체 북마크 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: '북마크 삭제 중 오류가 발생했습니다.'
      });
    }
  }

  // ============================================================================
  // 유틸리티 메서드들
  // ============================================================================

  /**
   * 지속시간 문자열에서 시간 숫자 추출
   */
  private extractHours(duration: string): number {
    if (!duration) return 0;
    
    const hourMatch = duration.match(/(\d+)시간/);
    if (hourMatch) return parseInt(hourMatch[1], 10);
    
    const dayMatch = duration.match(/(\d+)일/);
    if (dayMatch) return parseInt(dayMatch[1], 10) * 8; // 1일 = 8시간으로 가정
    
    return 0;
  }

  /**
   * 장소 데이터에서 지역 코드 추출
   */
  private extractRegionCodes(places: any[]): string[] {
    if (!places || places.length === 0) return [];
    
    const regionCodes: string[] = [];
    
    places.forEach(place => {
      // 장소 주소나 기타 정보에서 지역 코드 추출 로직
      if (place.address || place.location) {
        const address = place.address || place.location || '';
        
        if (address.includes('서울')) regionCodes.push('SEL');
        else if (address.includes('부산')) regionCodes.push('BSN');
        else if (address.includes('제주')) regionCodes.push('JJD');
        else if (address.includes('인천') || address.includes('경기')) regionCodes.push('SDG');
        else if (address.includes('강원')) regionCodes.push('GWD');
        else if (address.includes('충청') || address.includes('대전')) regionCodes.push('CCD');
        else if (address.includes('경상') || address.includes('대구') || address.includes('울산')) regionCodes.push('GSD');
        else if (address.includes('전라') || address.includes('광주')) regionCodes.push('JLD');
        else regionCodes.push('ETC');
      }
    });
    
    // 중복 제거
    return [...new Set(regionCodes)];
  }
}