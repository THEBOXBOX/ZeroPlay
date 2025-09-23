import { Request, Response } from 'express';
import { AIService, TravelFilter } from '../services/AIService';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * AI 채팅 - 사용자 메시지에 대한 응답
   */
  chatWithAI = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, sessionId } = req.body;

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Message is required'
        });
        return;
      }

      // 간단한 응답 생성 (실제로는 더 복잡한 로직)
      const responses = [
        '좋은 선택이네요! 🎯\n더 구체적인 정보를 알려주시면\n맞춤 코스를 추천해드릴게요.',
        '그 지역은 정말 멋진 곳이에요! ✨\n어떤 컨셉의 여행을 원하시나요?\n(맛집, 카페, 관광, 힐링 등)',
        '예산과 동행인에 대해서도\n알려주시면 더 정확한\n추천이 가능해요! 💡',
        '잠시만요, 최적의 여행 코스를\n찾고 있어요! 🔍\n곧 완성될 예정입니다.',
        '완벽한 여행 코스를 생성했어요! 🎉\n하단의 [추천 결과] 탭에서\n확인해보세요!'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      res.json({
        success: true,
        data: {
          message: randomResponse,
          type: 'text'
        }
      });
    } catch (error) {
      console.error('Error in chatWithAI:', error);
      res.status(500).json({
        success: false,
        message: 'AI 응답 생성 중 오류가 발생했습니다.'
      });
    }
  };

  /**
   * AI 기반 여행 코스 추천
   */
  generateRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, filters, sessionId } = req.body;

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Message is required'
        });
        return;
      }

      // 기본 필터 설정
      const travelFilter: TravelFilter = {
        budget: filters?.budget || '',
        duration: filters?.duration || '',
        companions: filters?.companions || '',
        interests: filters?.interests || [],
        region: filters?.region || ''
      };

      console.log('🔍 여행 코스 생성 요청:', { message, travelFilter });

      // 1단계: RAG 검색으로 관련 장소 찾기
      const relevantPlaces = await this.aiService.performRAGSearch(message, travelFilter);
      console.log(`📍 검색된 장소 수: ${relevantPlaces.length}`);

      if (relevantPlaces.length === 0) {
        res.json({
          success: true,
          data: {
            routes: [],
            message: '조건에 맞는 관광지를 찾을 수 없습니다. 다른 조건으로 다시 시도해보세요.'
          }
        });
        return;
      }

      // 2단계: AI로 여행 코스 생성
      const routes = await this.aiService.generateTravelRoutes(relevantPlaces, message, travelFilter);
      console.log(`🗺️ 생성된 코스 수: ${routes.length}`);

      // 세션에 추천 기록 저장 (옵션)
      if (sessionId) {
        await this.saveRecommendationRecord(sessionId, travelFilter, routes);
      }

      res.json({
        success: true,
        data: {
          routes,
          totalPlaces: relevantPlaces.length,
          searchFilters: travelFilter
        }
      });

    } catch (error) {
      console.error('Error in generateRoutes:', error);
      res.status(500).json({
        success: false,
        message: 'AI 코스 생성 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * 추천 기록 저장
   */
  private saveRecommendationRecord = async (sessionId: string, filters: TravelFilter, routes: any[]): Promise<void> => {
    try {
      // 실제 구현시에는 DB에 저장
      console.log('💾 추천 기록 저장:', { sessionId, filters, routeCount: routes.length });
    } catch (error) {
      console.error('Error saving recommendation record:', error);
    }
  };

  /**
   * 필터 기반 장소 검색 (테스트용)
   */
  searchPlaces = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: TravelFilter = {
        budget: req.query.budget as string || '',
        duration: req.query.duration as string || '',
        companions: req.query.companions as string || '',
        interests: (req.query.interests as string)?.split(',') || [],
        region: req.query.region as string || ''
      };

      const places = await this.aiService.searchPlacesByFilter(filters);

      res.json({
        success: true,
        data: {
          places,
          count: places.length,
          filters
        }
      });
    } catch (error) {
      console.error('Error in searchPlaces:', error);
      res.status(500).json({
        success: false,
        message: '장소 검색 중 오류가 발생했습니다.'
      });
    }
  };
}